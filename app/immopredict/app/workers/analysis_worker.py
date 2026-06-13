from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models.analysis_task import AnalysisTask
from app.models.property_transaction import PropertyTransaction
from app.models.sector_analysis import SectorAnalysis
from app.ml.predictor import PricePredictor
from app.services.cleaning_service import CleaningService
from app.services.dvf_service import DVFService
from app.utils.logging import get_logger

logger = get_logger("analysis_worker")


class AnalysisWorker:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self.session_factory = session_factory
        self.dvf = DVFService()
        self.cleaner = CleaningService()
        self.predictor = PricePredictor()

    async def run_analysis(self, task_id: int) -> None:
        try:
            async with self.session_factory() as session:
                task = await session.get(AnalysisTask, task_id)
                if task is None:
                    logger.error("Task %d not found", task_id)
                    return

                try:
                    await self._update_task(
                        session, task, status="processing", progress=0.0
                    )
                    await self._process_department(session, task)
                    await self._update_task(
                        session, task, status="completed", progress=100.0
                    )
                    logger.info("Analysis task %d completed successfully", task_id)
                except Exception as e:
                    logger.exception("Analysis task %d failed: %s", task_id, e)
                    try:
                        await session.rollback()
                    except Exception:
                        pass
                    try:
                        await self._update_task(
                            session,
                            task,
                            status="failed",
                            message=f"Error: {e!s}",
                        )
                        await session.commit()
                    except Exception as e2:
                        logger.error(
                            "Failed to update task %d status to failed: %s",
                            task_id,
                            e2,
                        )
        except Exception as e:
            logger.exception(
                "Unhandled error in run_analysis for task %d: %s", task_id, e
            )
        finally:
            await self.dvf.close()

    async def _process_department(
        self, session: AsyncSession, task: AnalysisTask
    ) -> None:
        department = task.department
        logger.info("Starting analysis for department %s", department)

        all_rows: list[dict[str, Any]] = []
        years = list(range(2021, 2026))
        total_years = len(years)
        fetch_start = 5.0
        fetch_end = 25.0
        fetch_range = fetch_end - fetch_start

        for i, year in enumerate(years):
            await self._update_task(
                session,
                task,
                progress=round(fetch_start + (i / total_years) * fetch_range, 1),
                message=f"Downloading DVF data for department {department}, year {year} ({i + 1}/{total_years})...",
            )
            rows = await self.dvf.fetch_department_data(department, year)
            if rows:
                logger.info("Fetched %d rows for department %s, year %d", len(rows), department, year)
                all_rows.extend(rows)
            else:
                logger.warning("No data for department %s, year %d", department, year)

        if not all_rows:
            logger.warning("No data fetched for department %s", department)
            await self._update_task(
                session, task, progress=100.0, message="No data found for this department"
            )
            return

        logger.info(
            "Fetched %d total rows for department %s", len(all_rows), department
        )

        clean_end = 35.0
        await self._update_task(
            session,
            task,
            progress=clean_end,
            message=f"Cleaning {len(all_rows)} transactions...",
        )

        df = self.cleaner.clean_transactions(all_rows)

        store_start = clean_end
        store_end = 65.0
        await self._update_task(
            session,
            task,
            progress=round(store_start, 1),
            message=f"Storing {len(df)} transactions...",
        )

        await self._store_transactions(session, df, task, store_start, store_end)

        analyze_start = store_end
        await self._update_task(
            session,
            task,
            progress=analyze_start,
            message="Running ML analysis by city and sector...",
        )

        await self._analyze_dataframe(session, task, df, analyze_start)

    async def _store_transactions(
        self, session: AsyncSession, df: pd.DataFrame, task: AnalysisTask,
        progress_start: float, progress_end: float
    ) -> None:
        if df.empty:
            logger.warning("No transactions to store")
            return

        total = len(df)
        batch_size = max(1, total // 20) if total > 100 else total

        for idx, (_, row) in enumerate(df.iterrows()):
            tx = PropertyTransaction(
                mutation_date=(
                    row["mutation_date"].to_pydatetime()
                    if pd.notna(row.get("mutation_date"))
                    else None
                ),
                price=float(row["price"]) if pd.notna(row.get("price")) else None,
                surface=float(row["surface"]) if pd.notna(row.get("surface")) else None,
                price_per_m2=(
                    float(row["price_per_m2"])
                    if pd.notna(row.get("price_per_m2"))
                    else None
                ),
                property_type=(
                    str(row["property_type"])
                    if pd.notna(row.get("property_type"))
                    else None
                ),
                city=(
                    str(row["city"]) if pd.notna(row.get("city")) else None
                ),
                postal_code=(
                    str(row["postal_code"])
                    if pd.notna(row.get("postal_code"))
                    else None
                ),
                department=(
                    str(row["department"])
                    if pd.notna(row.get("department"))
                    else None
                ),
                latitude=(
                    float(row["latitude"]) if pd.notna(row.get("latitude")) else None
                ),
                longitude=(
                    float(row["longitude"]) if pd.notna(row.get("longitude")) else None
                ),
            )
            session.add(tx)

            if idx % batch_size == 0 and idx > 0:
                pct = progress_start + (idx / total) * (progress_end - progress_start)
                await self._update_task(
                    session, task, progress=round(pct, 1),
                    message=f"Storing transaction {idx}/{total}...",
                )

        await session.flush()
        await self._update_task(
            session, task, progress=progress_end,
            message=f"Stored {total} transactions in database",
        )
        logger.info("Stored %d transactions in database", total)

    async def _analyze_dataframe(
        self, session: AsyncSession, task: AnalysisTask, df: pd.DataFrame,
        progress_start: float = 65.0
    ) -> None:
        if df.empty:
            logger.warning("No data to analyze")
            return

        department = task.department

        if "city" not in df.columns:
            df["city"] = "Unknown"

        cities = df["city"].dropna().unique() if "city" in df.columns else ["Unknown"]
        total_cities = len(cities)

        analyze_range = 30.0
        for idx, city in enumerate(cities):
            progress = progress_start + round(((idx + 1) / total_cities) * analyze_range, 1)
            await self._update_task(
                session,
                task,
                progress=progress,
                current_city=str(city),
                message=f"Analysing city {city} ({idx + 1}/{total_cities})",
            )

            city_df = df[df["city"] == city].copy()

            main_analysis = self._compute_analysis(
                city_df, str(city), department, sector=None
            )
            if main_analysis:
                session.add(main_analysis)

            postal_codes = city_df["postal_code"].dropna().unique()
            for pcode in postal_codes:
                sector_df = city_df[city_df["postal_code"] == pcode]
                sector_analysis = self._compute_analysis(
                    sector_df, str(city), department, sector=str(pcode)
                )
                if sector_analysis:
                    session.add(sector_analysis)

            await session.flush()

        await self._update_task(
            session, task, progress=99.0, message="Analysis complete"
        )

    def _compute_analysis(
        self,
        df: pd.DataFrame,
        city: str,
        department: str,
        sector: str | None = None,
    ) -> SectorAnalysis | None:
        if df.empty:
            return None

        avg_price_m2 = (
            float(df["price_per_m2"].mean()) if "price_per_m2" in df.columns else None
        )
        median_price_m2 = (
            float(df["price_per_m2"].median()) if "price_per_m2" in df.columns else None
        )
        transaction_count = len(df)

        yearly_growth = self.predictor.compute_yearly_growth(df)

        params = self.predictor.train(df)
        predicted_price = self.predictor.predict_next_year(df)

        df["year"] = pd.to_datetime(df["mutation_date"]).dt.year
        analysis_year = (
            int(df["year"].max())
            if "year" in df.columns and df["year"].notna().any()
            else None
        )

        return SectorAnalysis(
            city=city,
            sector=sector,
            department=department,
            avg_price_m2=avg_price_m2,
            median_price_m2=median_price_m2,
            transaction_count=transaction_count,
            yearly_growth_percent=yearly_growth,
            predicted_price_next_year=predicted_price,
            model_slope=params["slope"],
            model_intercept=params["intercept"],
            analysis_year=analysis_year,
        )

    async def _update_task(
        self,
        session: AsyncSession,
        task: AnalysisTask,
        status: str | None = None,
        progress: float | None = None,
        current_city: str | None = None,
        message: str | None = None,
    ) -> None:
        if status:
            task.status = status
            if status == "processing" and task.started_at is None:
                task.started_at = datetime.now(timezone.utc)
            if status == "completed":
                task.completed_at = datetime.now(timezone.utc)
        if progress is not None:
            task.progress = progress
        if current_city is not None:
            task.current_city = current_city
        if message is not None:
            task.message = message
        await session.flush()
        await session.commit()
        logger.info(
            "Task %s: status=%s progress=%.1f city=%s msg=%s",
            task.id,
            task.status,
            task.progress,
            task.current_city or "",
            task.message or "",
        )
