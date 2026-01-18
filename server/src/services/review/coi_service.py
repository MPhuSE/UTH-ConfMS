from typing import List, Dict, Any
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from domain.exceptions import NotFoundError, BusinessRuleException
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
        """
        Declare a conflict of interest.
        
        Args:
            submission_id: ID of the submission
            user_id: ID of the user (reviewer) declaring COI
            coi_type: Type of COI (e.g., "author", "colleague", "institution", "other")
        
        Returns:
            Dict with COI information
        """
        # Check if submission exists
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        # Check if COI already exists
        existing_cois = self.review_repo.get_cois_by_submission(submission_id)
        for coi in existing_cois:
            if coi.user_id == user_id:
                # Update existing COI
                coi.coi_type = coi_type
                self.db.commit()
                self.db.refresh(coi)
                return {
                    "submission_id": coi.submission_id,
                    "user_id": coi.user_id,
                    "coi_type": coi.coi_type,
                    "detected_by_system": coi.detected_by_system
                }
        
        # Create new COI
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
        """
        Check if there's a COI between a user and a submission.
        
        This checks:
        1. Direct COI declarations
        2. If user is an author of the submission
        3. Auto-detected COIs
        
        Returns:
            True if COI exists, False otherwise
        """
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
    
    def auto_detect_coi(self, submission_id: int, user_id: int) -> bool:
        """
        Auto-detect COI by checking if user is an author of the submission.
        If COI is detected, it's automatically recorded.
        
        Returns:
            True if COI was detected, False otherwise
        """
        # Check if user is already an author (this is checked in check_coi)
        has_coi = self.check_coi(submission_id, user_id)
        
        if has_coi:
            # Check if COI is already recorded
            existing_cois = self.review_repo.get_cois_by_submission(submission_id)
            coi_exists = any(c.user_id == user_id for c in existing_cois)
            
            if not coi_exists:
                # Auto-record the COI
                self.review_repo.create_coi(
                    submission_id=submission_id,
                    user_id=user_id,
                    coi_type="author",  # Auto-detected as author
                    detected_by_system=True
                )
        
        return has_coi
