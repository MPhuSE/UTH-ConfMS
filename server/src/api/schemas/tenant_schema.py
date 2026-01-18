from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class TenantCreateRequest(BaseModel):
    name: str
    slug: str
    is_active: bool = True


class TenantUpdateRequest(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    is_active: Optional[bool] = None


class TenantResponse(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TenantListResponse(BaseModel):
    tenants: List[TenantResponse]
    total: int


class TenantMemberCreateRequest(BaseModel):
    user_id: int
    role: Optional[str] = "member"


class TenantMemberResponse(BaseModel):
    tenant_id: int
    user_id: int
    role: str
    user_full_name: Optional[str] = None
    user_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TenantMemberListResponse(BaseModel):
    members: List[TenantMemberResponse]
