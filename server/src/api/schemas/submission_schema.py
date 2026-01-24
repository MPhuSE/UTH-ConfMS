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
    full_name: Optional[str] = "N/A"
    email: Optional[str] = "N/A"
    affiliation: Optional[str] = None
    order_index: int
    
    model_config = ConfigDict(from_attributes=True)
class SubmissionPatchSchema(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SubmissionResponseSchema(BaseModel):
    id: int
    conference_id: Optional[int] = None
    track_id: Optional[int] = None
    title: str
    abstract: str
    status: str
    decision: Optional[str] = None
    file_path: Optional[str] = None
    track: Optional[TrackShortSchema] = None 
    authors: List[AuthorShortSchema] = [] 
    camera_ready_submission: Optional[int] = None
    created_at: Optional[str] = None
    avg_score: Optional[float] = None
    final_score: Optional[float] = None
    model_config = ConfigDict(
        from_attributes=True,
        # Đảm bảo serialize cả None values
        exclude_none=False
    )