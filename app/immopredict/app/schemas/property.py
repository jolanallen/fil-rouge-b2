from datetime import datetime

from pydantic import BaseModel


class PropertyTransactionResponse(BaseModel):
    id: int
    mutation_date: datetime | None = None
    price: float | None = None
    surface: float | None = None
    price_per_m2: float | None = None
    property_type: str | None = None
    city: str | None = None
    postal_code: str | None = None
    department: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime | None = None
