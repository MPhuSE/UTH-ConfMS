import logging
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from infrastructure.email.email_service import EmailService
logger = logging.getLogger(__name__)

class ResultNotificationService:
    def __init__(self, submission_repo: SubmissionRepository, email_service: EmailService, db=None):
        self.submission_repo = submission_repo
        self.email_service = email_service
        self.db = db

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

        # 2. Review details (use ReviewModel fields)
        review_details_html = "<p>Chưa có chi tiết đánh giá.</p>"
        if self.db is not None:
            try:
                from infrastructure.models.review_model import ReviewModel
                from infrastructure.models.user_model import UserModel
                reviews = (
                    self.db.query(ReviewModel, UserModel)
                    .join(UserModel, UserModel.id == ReviewModel.reviewer_id)
                    .filter(ReviewModel.submission_id == submission_id)
                    .order_by(ReviewModel.id.asc())
                    .all()
                )
                if reviews:
                    chunks = []
                    for i, (review, reviewer) in enumerate(reviews, 1):
                        display_name = f"Reviewer #{i}" if hide_reviewer else (getattr(reviewer, "full_name", None) or getattr(reviewer, "email", None) or f"Reviewer #{i}")
                        summary = getattr(review, "summary", None) or ""
                        weakness = getattr(review, "weakness", None) or ""
                        chunks.append(
                            f"""
                            <div style="border-bottom: 1px solid #ddd; padding: 10px 0; margin-bottom: 10px;">
                                <p style="margin: 0;"><strong>{display_name}</strong></p>
                                <p style="margin: 5px 0; color: #555;"><i>Tóm tắt:</i> {summary}</p>
                                <p style="margin: 5px 0; color: #555;"><i>Điểm yếu:</i> {weakness}</p>
                            </div>
                            """
                        )
                    review_details_html = "\n".join(chunks)
            except Exception:
                pass

        # 3. Soạn nội dung email HTML (CNPM-158)
        title = f"Kết quả thẩm định bài nộp: {submission.title}"
        decision_value = getattr(submission, "decision", None) or getattr(submission, "status", None) or "N/A"
        content_html = f"""
        <div style="font-family: sans-serif; line-height: 1.6;">
            <h2 style="color: #2c3e50;">Thông báo kết quả thẩm định</h2>
            <p>Kính gửi Tác giả,</p>
            <p>Chúng tôi xin thông báo bài nộp <strong>{submission.title}</strong> đã có kết quả thẩm định chính thức.</p>
            <p>Kết quả: <strong style="text-transform: uppercase; color: #2e7d32;">{decision_value}</strong></p>
            
            <h3 style="border-left: 4px solid #3498db; padding-left: 10px;">Chi tiết đánh giá:</h3>
            {review_details_html}
            
            <p style="margin-top: 20px;">Trân trọng,<br><strong>Ban tổ chức hội nghị</strong></p>
        </div>
        """

        # 4. Recipient: corresponding author email from submission_authors
        to_email = None
        try:
            if hasattr(submission, "authors") and submission.authors:
                corresponding = [a for a in submission.authors if getattr(a, "is_corresponding", False)]
                pick = corresponding[0] if corresponding else sorted(submission.authors, key=lambda a: (getattr(a, "order_index", 9999) or 9999))[0]
                to_email = getattr(pick, "email", None)
        except Exception:
            to_email = None

        if not to_email:
            logger.error("Không tìm thấy email tác giả chính để gửi kết quả")
            return False

        # 5. Send via EmailService
        return await self.email_service.send_notification(
            to_email=to_email,
            title=title,
            content=content_html
        )