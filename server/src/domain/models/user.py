from typing import Optional, List
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class User:
    email: str
    id: Optional[int] = None
    full_name: Optional[str] = None
    affiliation: Optional[str] = None
    phone_number: Optional[str] = None
    website_url: Optional[str] = None
    
    is_verified: bool = False
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None
    
    roles: List[str] = field(default_factory=list)
    sso_provider: Optional[str] = None
    sso_id: Optional[str] = None

    def update_profile(
        self, 
        full_name: Optional[str] = None, 
        affiliation: Optional[str] = None,
        phone_number: Optional[str] = None,
        website_url: Optional[str] = None
    ):
        """Logic nghiệp vụ cập nhật thông tin cá nhân."""
        if full_name is not None:
            self.full_name = full_name
        if affiliation is not None:
            self.affiliation = affiliation
        if phone_number is not None:
            self.phone_number = phone_number
        if website_url is not None:
            self.website_url = website_url