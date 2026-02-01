from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# --- CÁC SCHEMA CŨ CỦA BẠN (GIỮ NGUYÊN) ---

class TrackCreateInConference(BaseModel):
    """Track to create when creating conference"""
    name: str
    max_reviewers: int = 3


class ConferenceCreateRequest(BaseModel):
    name: str
    abbreviation: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None  # Đổi từ website_url
    location: Optional[str] = None  # Thêm location

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    review_deadline: Optional[datetime] = None

    is_open: bool = True
    blind_mode: str = "double"  # Đổi từ double_blind: enum single, double, open
    tenant_id: Optional[int] = None # Optional: gán cho tenant cụ thể
    
    # Workflow settings (Thêm mới)
    rebuttal_open: bool = False
    rebuttal_deadline: Optional[datetime] = None
    camera_ready_open: bool = False
    camera_ready_deadline: Optional[datetime] = None
    
    tracks: Optional[List[TrackCreateInConference]] = None  # Optional: tạo tracks cùng lúc

class TrackResponse(BaseModel):
    id: int
    name: str
    max_reviewers: int

    class Config:
        from_attributes = True

class ConferenceResponse(BaseModel):
    id: int
    name: str
    abbreviation: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None  # Đổi từ website_url
    location: Optional[str] = None  # Thêm location

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    review_deadline: Optional[datetime] = None

    is_open: bool
    blind_mode: str  # Đổi từ double_blind: enum single, double, open
    tenant_id: Optional[int] = None
    
    # Workflow settings
    rebuttal_open: Optional[bool] = False
    rebuttal_deadline: Optional[datetime] = None
    camera_ready_open: Optional[bool] = False
    camera_ready_deadline: Optional[datetime] = None
    
    # Extra fields for create response
    tracks: Optional[List[TrackResponse]] = None
    track_warnings: Optional[List[str]] = None
    message: Optional[str] = None

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