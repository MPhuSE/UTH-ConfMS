from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class ReviewAssignmentRequest(BaseModel):
    submission_id: int
    reviewer_id: int
    auto_assigned: bool = False


class ReviewAssignmentResponse(BaseModel):
    submission_id: int
    reviewer_id: int
    auto_assigned: bool


class ReviewSubmitRequest(BaseModel):
    summary: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None  # Đổi từ weakness thành weaknesses
    confidence: Optional[int] = None  # Thêm confidence (1-10)
    recommendation: Optional[str] = None  # Thêm recommendation (accept, weak_accept, borderline, weak_reject, reject)
    best_paper_recommendation: bool = False
    answers: Optional[List[Dict[str, Any]]] = None


class ReviewAnswerSchema(BaseModel):
    question_id: int
    answer: str


class ReviewResponse(BaseModel):
    id: int
    submission_id: int
    reviewer_id: int
    summary: Optional[str] = None
    strengths: Optional[str] = None  # Thêm strengths
    weaknesses: Optional[str] = None  # Đổi từ weakness thành weaknesses
    confidence: Optional[int] = None  # Thêm confidence
    recommendation: Optional[str] = None  # Thêm recommendation
    submitted_at: Optional[datetime] = None  # Thêm submitted_at
    best_paper_recommendation: bool = False
    answers: Optional[List[ReviewAnswerSchema]] = None
    
    class Config:
        from_attributes = True


class COIDeclareRequest(BaseModel):
    submission_id: int
    user_id: int
    coi_type: str


class COIResponse(BaseModel):
    submission_id: int
    user_id: int
    coi_type: str
    detected_by_system: bool


class BidRequest(BaseModel):
    submission_id: int
    reviewer_id: int
    bid: str  # "Yes", "No", "Maybe"


class BidResponse(BaseModel):
    submission_id: int
    reviewer_id: int
    bid: str

