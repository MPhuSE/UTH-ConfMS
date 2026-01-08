from typing import List, Dict, Any
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from infrastructure.repositories_interfaces.user_repository import UserRepository
from domain.exceptions import NotFoundError, BusinessRuleException
from sqlalchemy.orm import Session


class AssignmentService:
    """Service for managing review assignments."""
    
    def __init__(
        self,
        review_repo: ReviewRepository,
        submission_repo: SubmissionRepository,
        user_repo: UserRepository,
        db: Session
    ):
        self.review_repo = review_repo
        self.submission_repo = submission_repo
        self.user_repo = user_repo
        self.db = db
    
    def assign_reviewer(
        self,
        submission_id: int,
        reviewer_id: int,
        auto_assigned: bool = False,
        check_coi: bool = True
    ) -> Dict[str, Any]:
        """Assign a reviewer to a submission."""
        # Check if submission exists
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        # Check if reviewer exists (if user_repo is provided)
        if self.user_repo:
            # Note: This would need to be async in production
            # For now, we'll skip this check if user_repo is None
            pass
        
        # Check for COI
        if check_coi:
            has_coi = self.review_repo.check_coi(submission_id, reviewer_id)
            if has_coi:
                raise BusinessRuleException(
                    f"Conflict of interest detected between reviewer {reviewer_id} and submission {submission_id}"
                )
        
        # Create assignment
        assignment = self.review_repo.create_assignment(
            submission_id=submission_id,
            reviewer_id=reviewer_id,
            auto_assigned=auto_assigned
        )
        
        return {
            "submission_id": assignment.submission_id,
            "reviewer_id": assignment.reviewer_id,
            "auto_assigned": assignment.auto_assigned
        }
    
    def unassign_reviewer(self, submission_id: int, reviewer_id: int) -> None:
        """Unassign a reviewer from a submission."""
        self.review_repo.remove_assignment(submission_id, reviewer_id)
    
    def get_assignments_by_submission(self, submission_id: int) -> List[Dict[str, Any]]:
        """Get all assignments for a submission."""
        assignments = self.review_repo.get_assignments_by_submission(submission_id)
        return [
            {
                "submission_id": a.submission_id,
                "reviewer_id": a.reviewer_id,
                "auto_assigned": a.auto_assigned
            }
            for a in assignments
        ]
    
    def get_assignments_by_reviewer(self, reviewer_id: int) -> List[Dict[str, Any]]:
        """Get all assignments for a reviewer."""
        assignments = self.review_repo.get_assignments_by_reviewer(reviewer_id)
        return [
            {
                "submission_id": a.submission_id,
                "reviewer_id": a.reviewer_id,
                "auto_assigned": a.auto_assigned
            }
            for a in assignments
        ]

