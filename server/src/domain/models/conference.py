from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Conference:
    id: Optional[int]
    name: str
    abbreviation: Optional[str]
    description: Optional[str]
    website: Optional[str]  # Đổi từ website_url
    location: Optional[str]  # Thêm location

    start_date: Optional[datetime]
    end_date: Optional[datetime]
    submission_deadline: Optional[datetime]
    review_deadline: Optional[datetime]

    is_open: bool
    blind_mode: str  # Đổi từ double_blind: enum single, double, open
    tenant_id: Optional[int] = None
    
    # Workflow settings
    rebuttal_open: bool = False
    rebuttal_deadline: Optional[datetime] = None
    camera_ready_open: bool = False
    camera_ready_deadline: Optional[datetime] = None
