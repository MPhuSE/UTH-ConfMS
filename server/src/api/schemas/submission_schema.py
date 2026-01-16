from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# --- CÁC SCHEMA PHỤ (Phải định nghĩa trước) ---

class ConferenceShortSchema(BaseModel):
    id: int
    name: str
    abbreviation: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class TrackShortSchema(BaseModel):
    id: int
    name: str
    conference: Optional[ConferenceShortSchema] = None
    
    model_config = ConfigDict(from_attributes=True)

class AuthorShortSchema(BaseModel):
    full_name: str
    email: str
    affiliation: Optional[str] = None
    order_index: int
    
    model_config = ConfigDict(from_attributes=True)

# --- CÁC SCHEMA CHÍNH ---

class SubmissionPatchSchema(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SubmissionResponseSchema(BaseModel):
    id: int
    title: str
    abstract: str
    status: str
    decision: Optional[str] = None
    file_path: Optional[str] = None
    # Bây giờ các class dưới đây đã tồn tại nên sẽ không lỗi NameError
    track: Optional[TrackShortSchema] = None 
    authors: List[AuthorShortSchema] = [] 
    
    model_config = ConfigDict(from_attributes=True)