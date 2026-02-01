from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from infrastructure.databases.postgres import async_session
from infrastructure.models.system_model import SystemSettingsModel
from api.schemas.admin_schemas import SMTPConfigSchema, SMTPTestSchema
from infrastructure.security.auth_dependencies import get_current_user
from domain.models.user import User
from infrastructure.email.email_service import EmailService
from sqlalchemy.future import select
from datetime import datetime, timedelta

router = APIRouter(prefix="/smtp", tags=["SMTP"])

@router.get("/config")
async def get_smtp_config(current_user: User = Depends(get_current_user)):
    if "admin" not in [r.lower() for r in current_user.roles]:
        raise HTTPException(status_code=403, detail="Only admins can access SMTP config")
        
    async with async_session() as db:
        stmt = select(SystemSettingsModel)
        result = await db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            settings = SystemSettingsModel()
            db.add(settings)
            await db.commit()
            await db.refresh(settings)
            
        return {
            "smtp_host": settings.smtp_host,
            "smtp_port": settings.smtp_port,
            "smtp_user": settings.smtp_user,
            "smtp_from_email": settings.smtp_from_email,
            "smtp_from_name": settings.smtp_from_name,
            "mail_quota_daily": settings.mail_quota_daily,
            "mail_sent_today": settings.mail_sent_today,
            "last_quota_reset": settings.last_quota_reset
        }

@router.post("/config")
async def update_smtp_config(
    payload: SMTPConfigSchema,
    current_user: User = Depends(get_current_user)
):
    if "admin" not in [r.lower() for r in current_user.roles]:
        raise HTTPException(status_code=403, detail="Only admins can update SMTP config")
        
    async with async_session() as db:
        stmt = select(SystemSettingsModel)
        result = await db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            settings = SystemSettingsModel()
            db.add(settings)
            
        settings.smtp_host = payload.smtp_host
        settings.smtp_port = payload.smtp_port
        settings.smtp_user = payload.smtp_user
        if payload.smtp_password:
            settings.smtp_password = payload.smtp_password
        settings.smtp_from_email = payload.smtp_from_email
        settings.smtp_from_name = payload.smtp_from_name
        settings.mail_quota_daily = payload.mail_quota_daily
        
        await db.commit()
        return {"message": "SMTP configuration updated successfully"}

@router.post("/test")
async def test_smtp_config(
    payload: SMTPTestSchema,
    current_user: User = Depends(get_current_user)
):
    if "admin" not in [r.lower() for r in current_user.roles]:
        raise HTTPException(status_code=403, detail="Only admins can test SMTP config")
        
    email_service = EmailService()
    success = await email_service.send_email(
        to_email=payload.to_email,
        subject="Test SMTP Configuration - UTH-ConfMS",
        content="<p>This is a test email to verify your SMTP settings.</p>",
        is_html=True
    )
    
    if success:
        return {"message": f"Test email sent successfully to {payload.to_email}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test email. Check your SMTP settings and logs.")
