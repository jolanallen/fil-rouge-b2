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
