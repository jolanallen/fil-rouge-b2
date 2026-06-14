from __future__ import annotations

import asyncio
from datetime import datetime, timezone

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.api.dependencies import get_db, get_session_factory_dependency
from app.models.analysis_task import AnalysisTask
from app.models.property_transaction import PropertyTransaction
from app.models.sector_analysis import SectorAnalysis
from app.schemas.analysis import (
    AnalysisStartRequest,
    AnalysisTaskResponse,
    EstimatePriceRequest,
    EstimatePriceResponse,
    SectorAnalysisResponse,
)
from app.ml.predictor import PricePredictor
from app.utils.logging import get_logger
from app.utils.sse import event_stream
from app.workers.analysis_worker import AnalysisWorker

logger = get_logger("routes")

_background_tasks: set[asyncio.Task[None]] = set()

router = APIRouter()


def task_to_dict(task: AnalysisTask) -> dict:
    return {
        "task_id": task.id,
        "department": task.department,
        "status": task.status,
        "progress": task.progress,
        "current_city": task.current_city or "",
        "message": task.message or "",
        "started_at": (
            task.started_at.isoformat() if task.started_at else None
        ),
        "completed_at": (
            task.completed_at.isoformat() if task.completed_at else None
        ),
    }


@router.post("/analysis/start", response_model=AnalysisTaskResponse, status_code=201)
async def start_analysis(
    body: AnalysisStartRequest,
    session_factory: async_sessionmaker[AsyncSession] = Depends(
        get_session_factory_dependency
    ),
    db: AsyncSession = Depends(get_db),
) -> AnalysisTaskResponse:
    department = body.department_code

    task = AnalysisTask(
        department=department,
        status="pending",
        progress=0.0,
        started_at=None,
        completed_at=None,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    await db.commit()

    worker = AnalysisWorker(session_factory)
    task_ref = asyncio.create_task(worker.run_analysis(task.id))
    _background_tasks.add(task_ref)
    task_ref.add_done_callback(_background_tasks.discard)

    logger.info("Started analysis task %d for department %s", task.id, department)

    return AnalysisTaskResponse(
        task_id=task.id,
        department=task.department,
        status=task.status,
        progress=task.progress,
        current_city=task.current_city,
        message=task.message,
        started_at=task.started_at,
        completed_at=task.completed_at,
        created_at=task.created_at,
    )


@router.get("/analysis/task/{task_id}", response_model=AnalysisTaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
) -> AnalysisTaskResponse:
    task = await db.get(AnalysisTask, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return AnalysisTaskResponse(
        task_id=task.id,
        department=task.department,
        status=task.status,
        progress=task.progress,
        current_city=task.current_city,
        message=task.message,
        started_at=task.started_at,
        completed_at=task.completed_at,
        created_at=task.created_at,
    )


@router.get("/analysis/stream/{task_id}")
async def stream_analysis(
    task_id: int,
    db: AsyncSession = Depends(get_db),
):
    async def get_task_progress(tid: int):
        await db.commit()
        db.expire_all()
        task = await db.get(AnalysisTask, tid)
        if task is None:
            return None
        return task_to_dict(task)

    return StreamingResponse(
        event_stream(
            task_id=str(task_id),
            progress_getter=get_task_progress,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get(
    "/analysis/results/{department}", response_model=list[SectorAnalysisResponse]
)
async def get_analysis_results(
    department: str,
    db: AsyncSession = Depends(get_db),
) -> list[SectorAnalysisResponse]:
    result = await db.execute(
        select(SectorAnalysis).where(SectorAnalysis.department == department)
    )
    analyses = result.scalars().all()
    return [
        SectorAnalysisResponse(
            id=a.id,
            city=a.city,
            sector=a.sector,
            department=a.department,
            avg_price_m2=a.avg_price_m2,
            median_price_m2=a.median_price_m2,
            transaction_count=a.transaction_count,
            yearly_growth_percent=a.yearly_growth_percent,
            predicted_price_next_year=a.predicted_price_next_year,
            analysis_year=a.analysis_year,
            created_at=a.created_at,
        )
        for a in analyses
    ]


TYPE_MAP = {
    "appartement": "Appartement",
    "maison": "Maison",
    "terrain": "Terrain",
    "local-commercial": "Local",
}


@router.post("/analysis/estimate", response_model=EstimatePriceResponse)
async def estimate_price(
    body: EstimatePriceRequest,
    db: AsyncSession = Depends(get_db),
) -> EstimatePriceResponse:
    mapped_type = TYPE_MAP.get(body.type, body.type)
    department = body.postal_code[:2]

    async def fetch_transactions(postal_code: str | None = None):
        clause = PropertyTransaction.property_type.ilike(f"{mapped_type}%") & \
            PropertyTransaction.price.isnot(None) & \
            PropertyTransaction.surface.isnot(None) & \
            PropertyTransaction.price_per_m2.isnot(None)
        if postal_code:
            clause &= PropertyTransaction.postal_code == postal_code
        else:
            clause &= PropertyTransaction.department == department
        result = await db.execute(select(PropertyTransaction).where(clause))
        return result.scalars().all()

    transactions = await fetch_transactions(body.postal_code)

    if len(transactions) < 5:
        transactions = await fetch_transactions(None)

    if not transactions:
        raise HTTPException(
            status_code=404,
            detail=f"Aucune donnée DVF pour le code postal {body.postal_code} ({department}) avec le type {body.type}",
        )

    city = transactions[0].city or ""

    df = pd.DataFrame(
        [
            {
                "mutation_date": t.mutation_date,
                "price": t.price,
                "surface": t.surface,
                "price_per_m2": t.price_per_m2,
            }
            for t in transactions
        ]
    )

    predictor = PricePredictor()
    params = predictor.train(df)
    predicted_price_per_m2 = predictor.predict_next_year(df)

    if predicted_price_per_m2 is None:
        predicted_price_per_m2 = float(df["price_per_m2"].mean())
        confidence = 0.5
    else:
        confidence = min(abs(params.get("score", 0)) + 0.3, 0.95)

    estimated_price = predicted_price_per_m2 * body.surface

    return EstimatePriceResponse(
        postal_code=body.postal_code,
        type=body.type,
        surface=body.surface,
        estimated_price=round(estimated_price, 2),
        estimated_price_per_m2=round(predicted_price_per_m2, 2),
        confidence_score=round(confidence, 2),
        transaction_count=len(transactions),
        department=department,
        city=city,
        model_slope=round(params["slope"], 4),
        model_intercept=round(params["intercept"], 4),
    )


@router.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}
