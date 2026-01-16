from datetime import datetime, timezone
from fastapi import HTTPException, status

class EditSubmissionService:
    def __init__(self, repo):
        self.repo = repo

    def execute(self, submission_id: int, data: dict):
        submission = self.repo.get_by_id(submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        # 1. Lấy deadline từ database
        deadline = None
        if getattr(submission, "track", None) and getattr(submission.track, "conference", None):
            deadline = submission.track.conference.submission_deadline

        # 2. Xử lý lỗi so sánh Naive vs Aware
        if deadline:
            # Nếu deadline từ DB chưa có múi giờ (naive), ta ép nó về UTC để so sánh
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            
            # Bây giờ cả 2 đều là 'aware' (UTC), so sánh sẽ không lỗi nữa
            if datetime.now(timezone.utc) > deadline:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Submission deadline has passed; editing is not allowed"
                )

        # 3. Thực hiện update vào database thông qua repo
        return self.repo.update(submission_id, data)