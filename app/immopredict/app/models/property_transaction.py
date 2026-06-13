from datetime import date, datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class PropertyTransaction(Base):
    __tablename__ = "property_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    mutation_date: Mapped[date | None] = mapped_column(DateTime, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    surface: Mapped[float | None] = mapped_column(Float, nullable=True)
    price_per_m2: Mapped[float | None] = mapped_column(Float, nullable=True)
    property_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    postal_code: Mapped[str | None] = mapped_column(
        String(10), nullable=True, index=True
    )
    department: Mapped[str | None] = mapped_column(String(3), nullable=True, index=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
