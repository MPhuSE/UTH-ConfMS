from datetime import datetime, timezone
from fastapi import HTTPException, status

class EditSubmissionService:
    def __init__(self, repo):
        self.repo = repo

    def execute(self, submission_id: int, data: dict):
        submission = self.repo.get_by_id(submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        deadline = None
        if getattr(submission, "track", None) and getattr(submission.track, "conference", None):
            deadline = submission.track.conference.submission_deadline


        if deadline:
            
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            
            
            if datetime.now(timezone.utc) > deadline:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Submission deadline has passed; editing is not allowed"
                )

        return self.repo.update(submission_id, data)