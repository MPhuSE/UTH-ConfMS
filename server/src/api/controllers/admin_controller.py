from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from infrastructure.databases.postgres import get_db
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin
from infrastructure.models.system_model import SystemSettingsModel
from api.utils.audit_utils import create_audit_log_sync
from config import settings

router = APIRouter(prefix="/admin", tags=["Admin"])


class SMTPConfigRequest(BaseModel):
    host: str
    port: int
    user: str
    password: str
    from_email: str
    from_name: str


class SMTPConfigResponse(BaseModel):
    host: str
    port: int
    user: str
    from_email: str
    from_name: str


class QuotaConfigRequest(BaseModel):
    max_submissions_per_user: Optional[int] = None
    max_reviews_per_reviewer: Optional[int] = None
    max_file_size_mb: Optional[int] = None


class QuotaConfigResponse(BaseModel):
    max_submissions_per_user: Optional[int]
    max_reviews_per_reviewer: Optional[int]
    max_file_size_mb: Optional[int]


@router.get("/smtp-config", response_model=SMTPConfigResponse)
def get_smtp_config(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get SMTP configuration."""
    system_settings = db.query(SystemSettingsModel).first()
    if not system_settings:
        system_settings = SystemSettingsModel(
            smtp_host=settings.SMTP_HOST,
            smtp_port=int(settings.SMTP_PORT),
            smtp_user=settings.SMTP_USER,
            smtp_password=settings.SMTP_PASSWORD,
            smtp_from_email=settings.SMTP_FROM_EMAIL,
            smtp_from_name=settings.SMTP_FROM_NAME,
            quota_max_submissions_per_user=10,
            quota_max_reviews_per_reviewer=20,
            quota_max_file_size_mb=10,
        )
        db.add(system_settings)
        db.commit()
        db.refresh(system_settings)

    return SMTPConfigResponse(
        host=system_settings.smtp_host,
        port=system_settings.smtp_port or int(settings.SMTP_PORT),
        user=system_settings.smtp_user,
        from_email=system_settings.smtp_from_email,
        from_name=system_settings.smtp_from_name,
    )


@router.put("/smtp-config", response_model=SMTPConfigResponse)
def update_smtp_config(
    request: SMTPConfigRequest,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update SMTP configuration."""
    system_settings = db.query(SystemSettingsModel).first()
    if not system_settings:
        system_settings = SystemSettingsModel()
        db.add(system_settings)

    old_values = {
        "smtp_host": system_settings.smtp_host,
        "smtp_port": system_settings.smtp_port,
        "smtp_user": system_settings.smtp_user,
        "smtp_from_email": system_settings.smtp_from_email,
        "smtp_from_name": system_settings.smtp_from_name,
    }

    system_settings.smtp_host = request.host
    system_settings.smtp_port = request.port
    system_settings.smtp_user = request.user
    system_settings.smtp_password = request.password
    system_settings.smtp_from_email = request.from_email
    system_settings.smtp_from_name = request.from_name
    db.commit()
    db.refresh(system_settings)

    create_audit_log_sync(
        db,
        action_type="UPDATE",
        resource_type="SYSTEM",
        user_id=current_user.id,
        description="Updated SMTP configuration",
        old_values=old_values,
        new_values={
            "smtp_host": system_settings.smtp_host,
            "smtp_port": system_settings.smtp_port,
            "smtp_user": system_settings.smtp_user,
            "smtp_from_email": system_settings.smtp_from_email,
            "smtp_from_name": system_settings.smtp_from_name,
        },
        metadata={"section": "smtp-config"},
    )

    return SMTPConfigResponse(
        host=system_settings.smtp_host,
        port=system_settings.smtp_port,
        user=system_settings.smtp_user,
        from_email=system_settings.smtp_from_email,
        from_name=system_settings.smtp_from_name,
    )


@router.get("/quotas", response_model=QuotaConfigResponse)
def get_quotas(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get quota configuration."""
    system_settings = db.query(SystemSettingsModel).first()
    if not system_settings:
        system_settings = SystemSettingsModel(
            smtp_host=settings.SMTP_HOST,
            smtp_port=int(settings.SMTP_PORT),
            smtp_user=settings.SMTP_USER,
            smtp_password=settings.SMTP_PASSWORD,
            smtp_from_email=settings.SMTP_FROM_EMAIL,
            smtp_from_name=settings.SMTP_FROM_NAME,
            quota_max_submissions_per_user=10,
            quota_max_reviews_per_reviewer=20,
            quota_max_file_size_mb=10,
        )
        db.add(system_settings)
        db.commit()
        db.refresh(system_settings)

    return QuotaConfigResponse(
        max_submissions_per_user=system_settings.quota_max_submissions_per_user,
        max_reviews_per_reviewer=system_settings.quota_max_reviews_per_reviewer,
        max_file_size_mb=system_settings.quota_max_file_size_mb,
    )


@router.put("/quotas", response_model=QuotaConfigResponse)
def update_quotas(
    request: QuotaConfigRequest,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update quota configuration."""
    system_settings = db.query(SystemSettingsModel).first()
    if not system_settings:
        system_settings = SystemSettingsModel()
        db.add(system_settings)

    old_values = {
        "max_submissions_per_user": system_settings.quota_max_submissions_per_user,
        "max_reviews_per_reviewer": system_settings.quota_max_reviews_per_reviewer,
        "max_file_size_mb": system_settings.quota_max_file_size_mb,
    }

    if request.max_submissions_per_user is not None:
        system_settings.quota_max_submissions_per_user = request.max_submissions_per_user
    if request.max_reviews_per_reviewer is not None:
        system_settings.quota_max_reviews_per_reviewer = request.max_reviews_per_reviewer
    if request.max_file_size_mb is not None:
        system_settings.quota_max_file_size_mb = request.max_file_size_mb

    db.commit()
    db.refresh(system_settings)

    create_audit_log_sync(
        db,
        action_type="UPDATE",
        resource_type="SYSTEM",
        user_id=current_user.id,
        description="Updated quota configuration",
        old_values=old_values,
        new_values={
            "max_submissions_per_user": system_settings.quota_max_submissions_per_user,
            "max_reviews_per_reviewer": system_settings.quota_max_reviews_per_reviewer,
            "max_file_size_mb": system_settings.quota_max_file_size_mb,
        },
        metadata={"section": "quotas"},
    )

    return QuotaConfigResponse(
        max_submissions_per_user=system_settings.quota_max_submissions_per_user,
        max_reviews_per_reviewer=system_settings.quota_max_reviews_per_reviewer,
        max_file_size_mb=system_settings.quota_max_file_size_mb,
    )


@router.get("/system-health")
def get_system_health(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get system health status."""
    
    # Check database connection
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except:
        db_status = "unhealthy"
    
    return {
        "database": db_status,
        "status": "operational" if db_status == "healthy" else "degraded"
    }

