from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Mật khẩu tối thiểu 6 ký tự")
    full_name: Optional[str] = None
    affiliation: Optional[str] = None
    phone_number: Optional[str] = None
    website_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    role_ids: Optional[List[int]] = Field(default=None, description="Danh sách ID các role")


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    affiliation: Optional[str] = None
    phone_number: Optional[str] = None
    website_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class UserProfileUpdateRequest(BaseModel):
    """Fields a regular user can update on their own profile."""
    full_name: Optional[str] = None
    affiliation: Optional[str] = None
    phone_number: Optional[str] = None
    website_url: Optional[str] = None
    avatar_url: Optional[str] = None


class UserPasswordUpdateRequest(BaseModel):
    new_password: str = Field(..., min_length=6, description="Mật khẩu mới tối thiểu 6 ký tự")


class UserRoleUpdateRequest(BaseModel):
    role_id: int


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    affiliation: Optional[str] = None
    phone_number: Optional[str] = None
    website_url: Optional[str] = None
    avatar_url: Optional[str] = None
    last_login: Optional[datetime] = None
    is_verified: bool
    is_active: bool
    roles: List[str] = Field(default_factory=list, alias="role_names")
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    skip: int
    limit: int


class UserLookupResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    affiliation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserLookupListResponse(BaseModel):
    users: List[UserLookupResponse]
