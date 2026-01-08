from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from api.schemas.decision_schema import (
    DecisionRequest, DecisionResponse,
    DecisionStatisticsResponse, SubmissionDecisionResponse
)
from infrastructure.databases.postgres import get_db
from infrastructure.repositorties.review_repo_impl import ReviewRepositoryImpl
from infrastructure.repositorties.submission_repo_impl import SubmissionRepositoryImpl
from infrastructure.security.auth_dependencies import get_current_user
from services.decision.decision_service import DecisionService
from domain.exceptions import NotFoundError, BusinessRuleException

router = APIRouter(prefix="/decisions", tags=["Decisions"])


def get_review_repo(db: Session = Depends(get_db)):
    return ReviewRepositoryImpl(db)


def get_submission_repo(db: Session = Depends(get_db)):
    return SubmissionRepositoryImpl(db)


def get_decision_service(
    review_repo=Depends(get_review_repo),
    submission_repo=Depends(get_submission_repo),
    db=Depends(get_db)
):
    return DecisionService(review_repo, submission_repo, db)


@router.post("", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
def make_decision(
    request: DecisionRequest,
    current_user=Depends(get_current_user),
    service=Depends(get_decision_service)
):
    """Make a decision on a submission."""
    try:
        result = service.make_decision(
            submission_id=request.submission_id,
            decision=request.decision,
            decision_notes=request.decision_notes
        )
        return DecisionResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/conferences/{conference_id}", response_model=List[SubmissionDecisionResponse])
def get_decisions_by_conference(
    conference_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_decision_service)
):
    """Get all decisions for a conference."""
    try:
        decisions = service.get_decisions_by_conference(conference_id)
        return [SubmissionDecisionResponse(**d) for d in decisions]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/conferences/{conference_id}/statistics", response_model=DecisionStatisticsResponse)
def get_decision_statistics(
    conference_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_decision_service)
):
    """Get decision statistics for a conference."""
    try:
        stats = service.get_decision_statistics(conference_id)
        return DecisionStatisticsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

