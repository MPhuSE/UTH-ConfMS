from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from infrastructure.databases.postgres import get_db
from infrastructure.repositories.submission_repo_impl import SubmissionRepositoryImpl
from infrastructure.repositories.review_repo_impl import ReviewRepositoryImpl
from infrastructure.repositories.conference_repo_impl import ConferenceRepositoryImpl
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin_or_chair
from services.reports.analytics_service import AnalyticsService
from api.utils.audit_utils import create_audit_log_sync

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


def get_analytics_service(
    submission_repo=Depends(lambda db=Depends(get_db): SubmissionRepositoryImpl(db)),
    review_repo=Depends(lambda db=Depends(get_db): ReviewRepositoryImpl(db)),
    conference_repo=Depends(lambda db=Depends(get_db): ConferenceRepositoryImpl(db)),
    db=Depends(get_db)
):
    return AnalyticsService(submission_repo, review_repo, conference_repo, db)


@router.get("/conferences/{conference_id}/submissions-by-track")
def get_submissions_by_track(
    conference_id: int,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_analytics_service),
    db: Session = Depends(get_db)
):
    """Get submission statistics by track - only admin or chair can view."""
    try:
        result = service.get_submissions_by_track(conference_id)
        
        # Audit logging
        try:
            create_audit_log_sync(
                db,
                action_type="VIEW",
                resource_type="REPORT",
                user_id=current_user.id,
                resource_id=conference_id,
                description=f"Viewed submissions-by-track report for conference {conference_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"report_type": "submissions_by_track"},
            )
        except Exception:
            pass
        
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/conferences/{conference_id}/review-sla")
def get_review_sla(
    conference_id: int,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_analytics_service),
    db: Session = Depends(get_db)
):
    """Get review service-level agreement statistics - only admin or chair can view."""
    try:
        result = service.get_review_sla(conference_id)
        
        # Audit logging
        try:
            create_audit_log_sync(
                db,
                action_type="VIEW",
                resource_type="REPORT",
                user_id=current_user.id,
                resource_id=conference_id,
                description=f"Viewed review SLA report for conference {conference_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"report_type": "review_sla"},
            )
        except Exception:
            pass
        
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/conferences/{conference_id}/activity-logs")
def get_activity_logs(
    conference_id: int,
    req: Request,
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_analytics_service),
    db: Session = Depends(get_db)
):
    """Get activity logs for a conference - only admin or chair can view."""
    try:
        result = service.get_activity_logs(conference_id, limit)
        
        # Audit logging
        try:
            create_audit_log_sync(
                db,
                action_type="VIEW",
                resource_type="REPORT",
                user_id=current_user.id,
                resource_id=conference_id,
                description=f"Viewed activity logs for conference {conference_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"report_type": "activity_logs", "limit": limit},
            )
        except Exception:
            pass
        
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/conferences/{conference_id}/acceptance-rate-by-school")
def get_acceptance_rate_by_school(
    conference_id: int,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_analytics_service),
    db: Session = Depends(get_db)
):
    """Get acceptance rate by school/affiliation - only admin or chair can view."""
    try:
        result = service.get_acceptance_rate_by_school(conference_id)
        
        # Audit logging
        try:
            create_audit_log_sync(
                db,
                action_type="VIEW",
                resource_type="REPORT",
                user_id=current_user.id,
                resource_id=conference_id,
                description=f"Viewed acceptance-rate-by-school report for conference {conference_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"report_type": "acceptance_rate_by_school"},
            )
        except Exception:
            pass
        
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

