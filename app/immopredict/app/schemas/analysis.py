from datetime import datetime

from pydantic import BaseModel, Field


class AnalysisStartRequest(BaseModel):
    department_code: str = Field(
        ..., min_length=2, max_length=2, description="French department code (e.g. 75)"
    )


class AnalysisTaskResponse(BaseModel):
    task_id: int
    department: str
    status: str
    progress: float
    current_city: str | None = None
    message: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime | None = None


class SectorAnalysisResponse(BaseModel):
    id: int
    city: str
    sector: str | None = None
    department: str
    avg_price_m2: float | None = None
    median_price_m2: float | None = None
    transaction_count: int | None = None
    yearly_growth_percent: float | None = None
    predicted_price_next_year: float | None = None
    analysis_year: int | None = None
    created_at: datetime | None = None


class AnalysisStatusEvent(BaseModel):
    status: str
    progress: float = 0.0
    current_city: str = ""
    message: str = ""
    department: str = ""


class EstimatePriceRequest(BaseModel):
    postal_code: str = Field(
        ..., min_length=5, max_length=5, description="French postal code (e.g. 13100)"
    )
    surface: float = Field(..., gt=0, description="Surface area in m²")
    type: str = Field(
        ...,
        description="Property type: appartement, maison, terrain, local-commercial",
    )


class EstimatePriceResponse(BaseModel):
    postal_code: str
    type: str
    surface: float
    estimated_price: float
    estimated_price_per_m2: float
    confidence_score: float
    transaction_count: int
    department: str = ""
    city: str = ""
    model_slope: float = 0.0
    model_intercept: float = 0.0
