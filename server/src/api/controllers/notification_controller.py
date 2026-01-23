from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from infrastructure.databases.postgres import get_db
from infrastructure.repositories.submission_repo_impl import SubmissionRepositoryImpl
from infrastructure.email.email_service import EmailService
from services.notification.result_notification_service import ResultNotificationService
from infrastructure.security.rbac import require_admin_or_chair
from infrastructure.models.submission_model import SubmissionModel
from infrastructure.models.conference_model import ConferenceModel
from api.utils.audit_utils import create_audit_log_sync

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/send-result/{submission_id}")
async def notify_result(
    submission_id: int,
    req: Request,
    hide_reviewer: bool = True,  
    current_user = Depends(require_admin_or_chair),
    db: Session = Depends(get_db)
):
    """
    API gửi thông báo kết quả bài nộp cho tác giả qua Email.
    """
    repo = SubmissionRepositoryImpl(db)
    email_tool = EmailService(db_session=db)
    service = ResultNotificationService(repo, email_tool, db=db)
    
    success = await service.send_result_notification(submission_id, hide_reviewer)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Gửi email thất bại. Vui lòng kiểm tra lại cấu hình SMTP hoặc trạng thái bài nộp."
        )
    
    try:
        create_audit_log_sync(
            db,
            action_type="SEND",
            resource_type="NOTIFICATION",
            user_id=current_user.id,
            resource_id=submission_id,
            description=f"Sent result notification for submission {submission_id}",
            ip_address=req.client.host if req and req.client else None,
            user_agent=req.headers.get("user-agent") if req else None,
            metadata={
                "event": "send_result_notification",
                "submission_id": submission_id,
                "hide_reviewer": hide_reviewer,
            },
        )
    except Exception:
        pass
        
    return {"status": "success", "message": f"Đã gửi thông báo kết quả bài {submission_id} thành công."}


@router.post("/send-results/conferences/{conference_id}")
async def notify_results_bulk(
    conference_id: int,
    req: Request,
    hide_reviewer: bool = True,
    only_decided: bool = True,
    current_user = Depends(require_admin_or_chair),
    db: Session = Depends(get_db),
):
    """
    Bulk email results for all submissions in a conference.
    - only_decided=True: only send to submissions that have decision/status set to accepted/rejected/etc.
    """
    conf = db.query(ConferenceModel).filter(ConferenceModel.id == conference_id).first()
    if not conf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conference not found")

    repo = SubmissionRepositoryImpl(db)
    email_tool = EmailService(db_session=db)
    service = ResultNotificationService(repo, email_tool, db=db)

    q = db.query(SubmissionModel).filter(SubmissionModel.conference_id == conference_id)
    submissions = q.all()

    sent = 0
    failed = 0
    failures = []

    for s in submissions:
        decision_value = (getattr(s, "decision", None) or getattr(s, "status", None) or "").lower().strip()
        if only_decided and decision_value not in ("accepted", "rejected", "minor_revision", "major_revision", "accept", "reject"):
            continue
        ok = await service.send_result_notification(s.id, hide_reviewer=hide_reviewer)
        if ok:
            sent += 1
        else:
            failed += 1
            failures.append(s.id)

    try:
        create_audit_log_sync(
            db,
            action_type="SEND",
            resource_type="NOTIFICATION",
            user_id=current_user.id,
            resource_id=conference_id,
            description=f"Sent bulk decision notifications for conference {conference_id}",
            ip_address=req.client.host if req and req.client else None,
            user_agent=req.headers.get("user-agent") if req else None,
            metadata={
                "event": "bulk_notify_results",
                "conference_id": conference_id,
                "sent": sent,
                "failed": failed,
                "failures": failures[:50],
                "hide_reviewer": hide_reviewer,
                "only_decided": only_decided,
            },
        )
    except Exception:
        pass

    return {"status": "success", "conference_id": conference_id, "sent": sent, "failed": failed, "failures": failures}