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
    weakness: Optional[str] = None
    best_paper_recommendation: bool = False
    answers: Optional[List[Dict[str, Any]]] = None


class ReviewAnswerSchema(BaseModel):
    question_id: int
    answer: str


class ReviewResponse(BaseModel):
    id: int
    submission_id: int
    reviewer_id: int
    summary: Optional[str]
    weakness: Optional[str]
    best_paper_recommendation: bool
    answers: Optional[List[ReviewAnswerSchema]] = None


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

