from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# --- CÁC SCHEMA CŨ CỦA BẠN (GIỮ NGUYÊN) ---

class ConferenceCreateRequest(BaseModel):
    name: str
    abbreviation: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    review_deadline: Optional[datetime] = None

    is_open: bool = True
    double_blind: bool = True

class ConferenceResponse(BaseModel):
    id: int
    name: str
    abbreviation: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    review_deadline: Optional[datetime] = None

    is_open: bool
    double_blind: bool

    class Config:
        from_attributes = True

class ConferenceListResponse(BaseModel):
    conferences: List[ConferenceResponse]
    total: int


# --- CÁC SCHEMA MỚI CHO CHỨC NĂNG CFP (THÊM VÀO) ---

class UpdateCFPRequest(BaseModel):
    """Schema dùng cho API cập nhật nội dung CFP (CNPM-54)"""
    description: str
    submission_deadline: datetime

class PublicCFPResponse(BaseModel):
    """Schema dùng cho API lấy thông tin CFP công khai (CNPM-55)"""
    name: str
    abbreviation: Optional[str] = None
    description: Optional[str] = None
    submission_deadline: Optional[datetime] = None
    is_open: bool

    class Config:
        from_attributes = True