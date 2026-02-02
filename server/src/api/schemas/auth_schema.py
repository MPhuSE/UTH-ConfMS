from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    affiliation: Optional[str] = None
    # accept both `password_confirmation` and camelCase `passwordConfirmation`
    password_confirmation: str = Field(..., alias="passwordConfirmation")

    model_config = ConfigDict(populate_by_name=True)
    
    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.password_confirmation:
            raise ValueError('Mật khẩu xác nhận không khớp')
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChairSetupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: EmailStr
    affiliation: Optional[str] = None
    is_verified: bool
    is_active: bool
    roles: List[str] = Field(default_factory=list, alias="role_names")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class EmailVerificationRequest(BaseModel):
    token: str


class MessageResponse(BaseModel):
    message: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    
class ResendVerificationRequest(BaseModel):
    email: EmailStr

class ResetPasswordConfirmRequest(BaseModel):
    token: str
    new_password: str = Field(..., max_length=50)
