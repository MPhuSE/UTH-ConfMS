from typing import List, Dict, Any, Optional
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from domain.exceptions import NotFoundError, BusinessRuleException
from sqlalchemy.orm import Session


class ReviewService:
    """Service for managing reviews."""
    
    def __init__(
        self,
        review_repo: ReviewRepository,
        submission_repo: SubmissionRepository,
        db: Session
    ):
        self.review_repo = review_repo
        self.submission_repo = submission_repo
        self.db = db
    
    def submit_review(
        self,
        submission_id: int,
        reviewer_id: int,
        review_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Submit a review."""
        # Check if submission exists
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        # Check if reviewer is assigned
        assignment = self.review_repo.get_assignments_by_submission(submission_id)
        if not any(a.reviewer_id == reviewer_id for a in assignment):
            raise BusinessRuleException(
                f"Reviewer {reviewer_id} is not assigned to submission {submission_id}"
            )
        
        # Check if review already exists
        existing = self.review_repo.get_review(submission_id, reviewer_id)
        if existing:
            # Update existing review
            review = self.review_repo.update_review(submission_id, reviewer_id, review_data)
        else:
            # Create new review
            review = self.review_repo.create_review(submission_id, reviewer_id, review_data)
        
        return {
            "id": review.id,
            "submission_id": review.submission_id,
            "reviewer_id": review.reviewer_id,
            "summary": review.summary,
            "weakness": review.weakness,
            "best_paper_recommendation": review.best_paper_recommendation
        }
    
    def get_review(self, submission_id: int, reviewer_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific review."""
        review = self.review_repo.get_review(submission_id, reviewer_id)
        if not review:
            return None
        
        return {
            "id": review.id,
            "submission_id": review.submission_id,
            "reviewer_id": review.reviewer_id,
            "summary": review.summary,
            "weakness": review.weakness,
            "best_paper_recommendation": review.best_paper_recommendation,
            "answers": [
                {
                    "question_id": ans.question_id,
                    "answer": ans.answer
                }
                for ans in review.answers
            ] if review.answers else []
        }
    
    def get_reviews_by_submission(self, submission_id: int) -> List[Dict[str, Any]]:
        """Get all reviews for a submission."""
        reviews = self.review_repo.get_reviews_by_submission(submission_id)
        return [
            {
                "id": r.id,
                "submission_id": r.submission_id,
                "reviewer_id": r.reviewer_id,
                "summary": r.summary,
                "weakness": r.weakness,
                "best_paper_recommendation": r.best_paper_recommendation
            }
            for r in reviews
        ]

