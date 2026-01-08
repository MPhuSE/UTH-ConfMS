from typing import List, Dict, Any
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from domain.exceptions import NotFoundError
from sqlalchemy.orm import Session


class COIService:
    """Service for managing Conflicts of Interest."""
    
    def __init__(
        self,
        review_repo: ReviewRepository,
        submission_repo: SubmissionRepository,
        db: Session
    ):
        self.review_repo = review_repo
        self.submission_repo = submission_repo
        self.db = db
    
    def declare_coi(
        self,
        submission_id: int,
        user_id: int,
        coi_type: str
    ) -> Dict[str, Any]:
        """Declare a conflict of interest."""
        # Check if submission exists
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        coi = self.review_repo.create_coi(
            submission_id=submission_id,
            user_id=user_id,
            coi_type=coi_type,
            detected_by_system=False
        )
        
        return {
            "submission_id": coi.submission_id,
            "user_id": coi.user_id,
            "coi_type": coi.coi_type,
            "detected_by_system": coi.detected_by_system
        }
    
    def check_coi(self, submission_id: int, user_id: int) -> bool:
        """Check if there's a COI."""
        return self.review_repo.check_coi(submission_id, user_id)
    
    def get_cois_by_submission(self, submission_id: int) -> List[Dict[str, Any]]:
        """Get all COIs for a submission."""
        cois = self.review_repo.get_cois_by_submission(submission_id)
        return [
            {
                "submission_id": c.submission_id,
                "user_id": c.user_id,
                "coi_type": c.coi_type,
                "detected_by_system": c.detected_by_system
            }
            for c in cois
        ]
    
    def get_cois_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all COIs for a user."""
        cois = self.review_repo.get_cois_by_user(user_id)
        return [
            {
                "submission_id": c.submission_id,
                "user_id": c.user_id,
                "coi_type": c.coi_type,
                "detected_by_system": c.detected_by_system
            }
            for c in cois
        ]

