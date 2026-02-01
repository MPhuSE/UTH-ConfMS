from fastapi import APIRouter, Depends, HTTPException, status
from starlette.requests import Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from api.schemas.decision_schema import (
    DecisionRequest, DecisionResponse,
    DecisionStatisticsResponse, SubmissionDecisionResponse,
    BulkDecisionRequest, EmailPreviewRequest, EmailPreviewResponse
)
from infrastructure.databases.postgres import get_db
from infrastructure.repositories.review_repo_impl import ReviewRepositoryImpl
from infrastructure.repositories.submission_repo_impl import SubmissionRepositoryImpl
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin_or_chair
from services.decision.decision_service import DecisionService
from domain.exceptions import NotFoundError, BusinessRuleException
from api.utils.audit_utils import create_audit_log_sync

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
    from services.email.email_service import EmailService
    email_service = EmailService()
    return DecisionService(review_repo, submission_repo, db, email_service)


@router.post("", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
def make_decision(
    request: DecisionRequest,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_decision_service),
    db: Session = Depends(get_db)
):
    """Make a decision on a submission - only admin or chair can make decisions."""
    try:
        # Get old decision for audit
        submission_repo = get_submission_repo(db)
        old_submission = submission_repo.get_by_id(request.submission_id)
        old_decision = old_submission.decision if old_submission else None
        
        result = service.make_decision(
            submission_id=request.submission_id,
            decision=request.decision,
            decision_notes=request.decision_notes,
            final_score=request.final_score
        )
        
        # Audit logging
        try:
            create_audit_log_sync(
                db,
                action_type="DECIDE",
                resource_type="SUBMISSION",
                user_id=current_user.id,
                resource_id=request.submission_id,
                description=f"Made decision: {request.decision} on submission {request.submission_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                old_values={"decision": old_decision} if old_decision else None,
                new_values={
                    "decision": request.decision,
                    "decision_notes": request.decision_notes,
                },
            )
        except Exception:
            pass
        
        return DecisionResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/conferences/{conference_id}", response_model=List[SubmissionDecisionResponse])
def get_decisions_by_conference(
    conference_id: int,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_decision_service)
):
    """Get all decisions for a conference - only admin or chair can view."""
    try:
        decisions = service.get_decisions_by_conference(conference_id)
        return [SubmissionDecisionResponse(**d) for d in decisions]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/conferences/{conference_id}/statistics", response_model=DecisionStatisticsResponse)
def get_decision_statistics(
    conference_id: int,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_decision_service)
):
    """Get decision statistics for a conference - only admin or chair can view."""
    try:
        stats = service.get_decision_statistics(conference_id)
        return DecisionStatisticsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/bulk", response_model=List[Dict[str, Any]], status_code=status.HTTP_200_OK)
def make_decisions_bulk(
    request: BulkDecisionRequest,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_decision_service)
):
    """Make decisions for multiple submissions - only admin or chair."""
    try:
        results = service.make_decisions_bulk(
            submission_ids=request.submission_ids,
            decision=request.decision,
            decision_notes=request.decision_notes,
            final_score=request.final_score
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/email-preview", response_model=EmailPreviewResponse)
def preview_decision_email(
    request: EmailPreviewRequest,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_decision_service)
):
    """Preview decision email content."""
    try:
        result = service.preview_decision_email(
            submission_id=request.submission_id,
            decision=request.decision,
            decision_notes=request.decision_notes
        )
        return EmailPreviewResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

