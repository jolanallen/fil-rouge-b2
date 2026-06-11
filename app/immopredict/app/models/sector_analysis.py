from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class SectorAnalysis(Base):
    __tablename__ = "sector_analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    department: Mapped[str] = mapped_column(String(3), nullable=False, index=True)
    avg_price_m2: Mapped[float | None] = mapped_column(Float, nullable=True)
    median_price_m2: Mapped[float | None] = mapped_column(Float, nullable=True)
    transaction_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    yearly_growth_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    predicted_price_next_year: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    model_slope: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_intercept: Mapped[float | None] = mapped_column(Float, nullable=True)
    analysis_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
