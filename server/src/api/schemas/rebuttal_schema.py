from pydantic import BaseModel
from datetime import datetime


class RebuttalCreateRequest(BaseModel):
    submission_id: int
    content: str


class RebuttalResponse(BaseModel):
    id: int
    submission_id: int
    author_id: int
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

