from pydantic import BaseModel
from typing import Optional, List


class DecisionRequest(BaseModel):
    submission_id: int
    decision: str  # "Accept", "Reject", "Minor Revision", "Major Revision"
    decision_notes: Optional[str] = None


class DecisionResponse(BaseModel):
    submission_id: int
    status: str
    avg_score: Optional[float]
    decision_notes: Optional[str] = None


class DecisionStatisticsResponse(BaseModel):
    total_submissions: int
    accepted: int
    rejected: int
    acceptance_rate: float


class SubmissionDecisionResponse(BaseModel):
    submission_id: int
    title: str
    status: str
    avg_score: Optional[float]

