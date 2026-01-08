import logging
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from infrastructure.email.email_service import EmailService
logger = logging.getLogger(__name__)

class ResultNotificationService:
    def __init__(self, submission_repo: SubmissionRepository, email_service: EmailService):
        self.submission_repo = submission_repo
        self.email_service = email_service

    async def send_result_notification(self, submission_id: int, hide_reviewer: bool = True) -> bool:
        """
        CNPM-158: Gửi email thông báo kết quả.
        CNPM-159: Ẩn danh người đánh giá (Reviewer #1, #2...).
        """
        # 1. Lấy dữ liệu bài nộp từ Repository
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            logger.error(f"Không tìm thấy bài nộp với ID: {submission_id}")
            return False

        # 2. Xử lý logic ẩn danh cho danh sách đánh giá (CNPM-159)
        review_details_html = ""
        # Giả sử submission có quan hệ 'reviews' trong database
        if hasattr(submission, 'reviews') and submission.reviews:
            for i, review in enumerate(submission.reviews, 1):
                # Nếu hide_reviewer=True, dùng tên giả, ngược lại dùng tên thật từ object review
                display_name = f"Reviewer #{i}" if hide_reviewer else getattr(review, 'reviewer_name', f"Reviewer #{i}")
                
                review_details_html += f"""
                <div style="border-bottom: 1px solid #ddd; padding: 10px 0; margin-bottom: 10px;">
                    <p style="margin: 0;"><strong>{display_name}</strong></p>
                    <p style="margin: 5px 0; color: #555;"><i>Nhận xét:</i> {getattr(review, 'comments', 'Không có nhận xét chi tiết.')}</p>
                </div>
                """
        else:
            review_details_html = "<p>Chưa có chi tiết đánh giá.</p>"

        # 3. Soạn nội dung email HTML (CNPM-158)
        title = f"Kết quả thẩm định bài nộp: {submission.title}"
        content_html = f"""
        <div style="font-family: sans-serif; line-height: 1.6;">
            <h2 style="color: #2c3e50;">Thông báo kết quả thẩm định</h2>
            <p>Kính gửi Tác giả,</p>
            <p>Chúng tôi xin thông báo bài nộp <strong>{submission.title}</strong> đã có kết quả thẩm định chính thức.</p>
            <p>Trạng thái: <strong style="text-transform: uppercase; color: #2e7d32;">{submission.status}</strong></p>
            
            <h3 style="border-left: 4px solid #3498db; padding-left: 10px;">Chi tiết đánh giá:</h3>
            {review_details_html}
            
            <p style="margin-top: 20px;">Trân trọng,<br><strong>Ban tổ chức hội nghị</strong></p>
        </div>
        """

        # 4. Gửi qua EmailService (hàm async của bạn đã viết sẵn)
        return await self.email_service.send_notification(
            to_email=submission.author_email,
            title=title,
            content=content_html
        )