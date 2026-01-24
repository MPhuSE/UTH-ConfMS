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
        """
        Assign a reviewer to a submission.
        
        Validations:
        1. Submission must exist
        2. Reviewer must exist (if user_repo is provided)
        3. No COI should exist (if check_coi is True)
        4. Assignment should not already exist
        
        Args:
            submission_id: ID of the submission
            reviewer_id: ID of the reviewer
            auto_assigned: Whether this was auto-assigned
            check_coi: Whether to check for COI before assigning
        
        Returns:
            Dict with assignment information
        """
        # Check if submission exists
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        # Check if assignment already exists
        existing_assignments = self.review_repo.get_assignments_by_submission(submission_id)
        for assignment in existing_assignments:
            if assignment.reviewer_id == reviewer_id:
                raise BusinessRuleException(
                    f"Reviewer {reviewer_id} is already assigned to submission {submission_id}"
                )
        
        # Check for COI
        if check_coi:
            has_coi = self.review_repo.check_coi(submission_id, reviewer_id)
            if has_coi:
                raise BusinessRuleException(
                    f"Conflict of interest detected between reviewer {reviewer_id} and submission {submission_id}. "
                    "Cannot assign reviewer with COI."
                )
        
        # Create assignment
        assignment = self.review_repo.create_assignment(
            submission_id=submission_id,
            reviewer_id=reviewer_id,
            auto_assigned=auto_assigned
        )
        
        # Update submission status to "under_review" if this is the first assignment
        # and submission is still in "submitted" status
        if not existing_assignments and submission.status in (None, "submitted"):
            self.submission_repo.update(submission_id, {"status": "under_review"})
        
        return {
            "submission_id": assignment.submission_id,
            "reviewer_id": assignment.reviewer_id,
            "auto_assigned": assignment.auto_assigned
        }
    
    def unassign_reviewer(self, submission_id: int, reviewer_id: int) -> None:
        """
        Unassign a reviewer from a submission.
        
        Args:
            submission_id: ID of the submission
            reviewer_id: ID of the reviewer
        """
        # Check if assignment exists
        assignments = self.review_repo.get_assignments_by_submission(submission_id)
        assignment_exists = any(a.reviewer_id == reviewer_id for a in assignments)
        
        if not assignment_exists:
            raise NotFoundError(
                f"Assignment not found: reviewer {reviewer_id} is not assigned to submission {submission_id}"
            )
        
        self.review_repo.remove_assignment(submission_id, reviewer_id)
    
    def get_assignments_by_submission(self, submission_id: int) -> List[Dict[str, Any]]:
        """
        Get all assignments for a submission.
        
        Args:
            submission_id: ID of the submission
        
        Returns:
            List of assignment dictionaries
        """
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
        """
        Get all assignments for a reviewer.
        
        Args:
            reviewer_id: ID of the reviewer
        
        Returns:
            List of assignment dictionaries
        """
        assignments = self.review_repo.get_assignments_by_reviewer(reviewer_id)
        return [
            {
                "submission_id": a.submission_id,
                "reviewer_id": a.reviewer_id,
                "auto_assigned": a.auto_assigned
            }
            for a in assignments
        ]
