from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class PCInviteRequest(BaseModel):
    conference_id: int
    email: EmailStr
    role: str = "reviewer"
    expires_at: Optional[datetime] = None
    message: Optional[str] = None


class PCInvitationResponse(BaseModel):
    id: int
    conference_id: int
    email: EmailStr
    role: str
    status: str
    expires_at: Optional[datetime] = None
    invited_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PCInvitationListResponse(BaseModel):
    invitations: List[PCInvitationResponse]
    total: int


class PCAcceptRequest(BaseModel):
    token: str


class PCMemberResponse(BaseModel):
    conference_id: int
    user_id: int
    role: str
    user_email: Optional[str] = None
    user_full_name: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PCMemberListResponse(BaseModel):
    members: List[PCMemberResponse]
    total: int

