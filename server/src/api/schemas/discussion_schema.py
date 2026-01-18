from pydantic import BaseModel
from datetime import datetime


class DiscussionMessageCreateRequest(BaseModel):
    content: str


class DiscussionMessageResponse(BaseModel):
    id: int
    submission_id: int
    user_id: int
    user_name: str | None = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

