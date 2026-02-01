from fastapi import APIRouter, Depends, HTTPException, status
from starlette.requests import Request
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
    frontend_url: Optional[str] = None
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: Optional[str] = None


class SMTPConfigResponse(BaseModel):
    host: str
    port: int
    user: str
    from_email: str
    from_name: str
    frontend_url: Optional[str] = None
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: Optional[str] = None


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
            frontend_url=settings.FRONTEND_URL,
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
        frontend_url=system_settings.frontend_url or settings.FRONTEND_URL,
        google_client_id=system_settings.google_client_id,
        google_client_secret=system_settings.google_client_secret,
        google_redirect_uri=system_settings.google_redirect_uri,
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
        "frontend_url": system_settings.frontend_url,
    }

    system_settings.smtp_host = request.host
    system_settings.smtp_port = request.port
    system_settings.smtp_user = request.user
    system_settings.smtp_password = request.password
    system_settings.smtp_from_email = request.from_email
    system_settings.smtp_from_name = request.from_name
    system_settings.frontend_url = request.frontend_url
    system_settings.google_client_id = request.google_client_id
    system_settings.google_client_secret = request.google_client_secret
    system_settings.google_redirect_uri = request.google_redirect_uri
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
            "frontend_url": system_settings.frontend_url,
        },
        metadata={"section": "smtp-config"},
    )

    return SMTPConfigResponse(
        host=system_settings.smtp_host,
        port=system_settings.smtp_port,
        user=system_settings.smtp_user,
        from_email=system_settings.smtp_from_email,
        from_name=system_settings.smtp_from_name,
        frontend_url=system_settings.frontend_url,
        google_client_id=system_settings.google_client_id,
        google_client_secret=system_settings.google_client_secret,
        google_redirect_uri=system_settings.google_redirect_uri,
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


@router.post("/backup")
def create_backup(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db),
    req: Request = None
):
    """
    Create a database backup.
    Returns backup file path or backup data.
    Note: This is a basic implementation. For production, use proper backup tools like pg_dump.
    """
    import os
    from datetime import datetime
    from config import settings
    
    try:
        # Get database connection string
        db_url = settings.DATABASE_URL
        
        # Generate backup filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"uth_confms_backup_{timestamp}.sql"
        backup_path = os.path.join("backups", backup_filename)
        
        # Create backups directory if it doesn't exist
        os.makedirs("backups", exist_ok=True)
        
        # For PostgreSQL, use pg_dump (requires pg_dump to be installed)
        import subprocess
        try:
            subprocess.run(
                ["pg_dump", db_url, "-f", backup_path],
                check=True,
                capture_output=True
            )
            
            try:
                create_audit_log_sync(
                    db,
                    action_type="BACKUP",
                    resource_type="SYSTEM",
                    user_id=current_user.id,
                    description=f"Created database backup: {backup_filename}",
                    ip_address=req.client.host if req and req.client else None,
                    user_agent=req.headers.get("user-agent") if req else None,
                    metadata={"backup_file": backup_filename, "backup_path": backup_path},
                )
            except Exception:
                pass
            
            return {
                "status": "success",
                "message": "Backup created successfully",
                "backup_file": backup_filename,
                "backup_path": backup_path,
                "timestamp": timestamp
            }
        except subprocess.CalledProcessError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Backup failed: {e.stderr.decode() if e.stderr else str(e)}"
            )
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="pg_dump not found. Please install PostgreSQL client tools."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating backup: {str(e)}"
        )


@router.post("/restore")
def restore_backup(
    backup_file: str,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db),
    req: Request = None
):
    """
    Restore database from backup.
    WARNING: This will overwrite current database. Use with extreme caution.
    """
    import os
    from config import settings
    
    backup_path = os.path.join("backups", backup_file)
    
    if not os.path.exists(backup_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Backup file not found: {backup_file}"
        )
    
    try:
        db_url = settings.DATABASE_URL
        import subprocess
        
        try:
            # For PostgreSQL, use psql to restore
            with open(backup_path, 'r') as f:
                result = subprocess.run(
                    ["psql", db_url],
                    input=f.read(),
                    text=True,
                    capture_output=True,
                    check=True
                )
            
            try:
                create_audit_log_sync(
                    db,
                    action_type="RESTORE",
                    resource_type="SYSTEM",
                    user_id=current_user.id,
                    description=f"Restored database from backup: {backup_file}",
                    ip_address=req.client.host if req and req.client else None,
                    user_agent=req.headers.get("user-agent") if req else None,
                    metadata={"backup_file": backup_file},
                )
            except Exception:
                pass
            
            return {
                "status": "success",
                "message": "Database restored successfully",
                "backup_file": backup_file
            }
        except subprocess.CalledProcessError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Restore failed: {e.stderr.decode() if e.stderr else str(e)}"
            )
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="psql not found. Please install PostgreSQL client tools."
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error restoring backup: {str(e)}"
        )


@router.get("/backups")
def list_backups(
    current_user=Depends(require_admin)
):
    """List all available backup files."""
    import os
    from datetime import datetime
    
    backups_dir = "backups"
    if not os.path.exists(backups_dir):
        return {"backups": [], "total": 0}
    
    backups = []
    for filename in os.listdir(backups_dir):
        if filename.endswith(".sql"):
            filepath = os.path.join(backups_dir, filename)
            stat = os.stat(filepath)
            backups.append({
                "filename": filename,
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })
    
    backups.sort(key=lambda x: x["created_at"], reverse=True)
    return {"backups": backups, "total": len(backups)}

