from pydantic import BaseModel
from typing import Optional, List


class EmailTemplateCreateRequest(BaseModel):
    conference_id: int
    name: str
    subject: str
    body: str


class EmailTemplateUpdateRequest(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None


class EmailTemplateResponse(BaseModel):
    id: int
    conference_id: int
    name: str
    subject: str
    body: str

