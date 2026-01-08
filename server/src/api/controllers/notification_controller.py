from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from infrastructure.databases.postgres import get_db
from infrastructure.repositories.submission_repo_impl import SubmissionRepositoryImpl
from infrastructure.email.email_service import EmailService
from services.notification.result_notification_service import ResultNotificationService
from infrastructure.security.rbac import require_admin_or_chair

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/send-result/{submission_id}")
async def notify_result(
    submission_id: int,
    hide_reviewer: bool = True,  # CNPM-159: Mặc định là ẩn danh
    current_user = Depends(require_admin_or_chair), # Chỉ Chair/Admin được gửi
    db: Session = Depends(get_db)
):
    """
    API gửi thông báo kết quả bài nộp cho tác giả qua Email.
    """
    # Khởi tạo các thành phần cần thiết
    repo = SubmissionRepositoryImpl(db)
    email_tool = EmailService() # Class EmailService của bạn
    service = ResultNotificationService(repo, email_tool)
    
    # Thực hiện gửi email
    success = await service.send_result_notification(submission_id, hide_reviewer)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Gửi email thất bại. Vui lòng kiểm tra lại cấu hình SMTP hoặc trạng thái bài nộp."
        )
        
    return {"status": "success", "message": f"Đã gửi thông báo kết quả bài {submission_id} thành công."}