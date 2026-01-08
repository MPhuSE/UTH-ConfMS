from pydantic import BaseModel
from typing import Optional


class TrackCreateRequest(BaseModel):
    conference_id: int
    name: str
    max_reviewers: int = 3


class TrackUpdateRequest(BaseModel):
    name: Optional[str] = None
    max_reviewers: Optional[int] = None


class TrackResponse(BaseModel):
    id: int
    conference_id: int
    name: str
    max_reviewers: int

    class Config:
        from_attributes = True

