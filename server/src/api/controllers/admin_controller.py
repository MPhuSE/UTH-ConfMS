from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from infrastructure.databases.postgres import get_db
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin
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
    
    return SMTPConfigResponse(
        host=settings.SMTP_HOST,
        port=int(settings.SMTP_PORT),
        user=settings.SMTP_USER,
        from_email=settings.SMTP_FROM_EMAIL,
        from_name=settings.SMTP_FROM_NAME
    )


@router.put("/smtp-config", response_model=SMTPConfigResponse)
def update_smtp_config(
    request: SMTPConfigRequest,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update SMTP configuration."""
    
    # In production, this would update a database table or config file
    # For now, we'll just return the request
    return SMTPConfigResponse(
        host=request.host,
        port=request.port,
        user=request.user,
        from_email=request.from_email,
        from_name=request.from_name
    )


@router.get("/quotas", response_model=QuotaConfigResponse)
def get_quotas(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get quota configuration."""
    
    # In production, this would come from database
    return QuotaConfigResponse(
        max_submissions_per_user=10,
        max_reviews_per_reviewer=20,
        max_file_size_mb=10
    )


@router.put("/quotas", response_model=QuotaConfigResponse)
def update_quotas(
    request: QuotaConfigRequest,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update quota configuration."""
    
    # In production, this would update a database table
    return QuotaConfigResponse(
        max_submissions_per_user=request.max_submissions_per_user,
        max_reviews_per_reviewer=request.max_reviews_per_reviewer,
        max_file_size_mb=request.max_file_size_mb
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

