from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.api.dependencies import get_db, get_session_factory_dependency
from app.models.analysis_task import AnalysisTask
from app.models.sector_analysis import SectorAnalysis
from app.schemas.analysis import (
    AnalysisStartRequest,
    AnalysisTaskResponse,
    SectorAnalysisResponse,
)
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


@router.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}
