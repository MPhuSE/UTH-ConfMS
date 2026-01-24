from typing import List, Dict, Any, Optional
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from domain.exceptions import NotFoundError, BusinessRuleException
from sqlalchemy.orm import Session
from services.decision.decision_service import DecisionService


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
        """
        Submit a review.
        
        Validations:
        1. Submission must exist
        2. Reviewer must be assigned to the submission
        3. Review data must be valid
        
        Args:
            submission_id: ID of the submission
            reviewer_id: ID of the reviewer
            review_data: Dictionary containing review information
        
        Returns:
            Dict with review information
        """
        # Check if submission exists
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        # Check if reviewer is assigned
        assignments = self.review_repo.get_assignments_by_submission(submission_id)
        is_assigned = any(a.reviewer_id == reviewer_id for a in assignments)
        
        if not is_assigned:
            raise BusinessRuleException(
                f"Reviewer {reviewer_id} is not assigned to submission {submission_id}. "
                "You must be assigned before submitting a review."
            )
        
        # Check for COI (should not happen if assignment was done correctly, but double-check)
        has_coi = self.review_repo.check_coi(submission_id, reviewer_id)
        if has_coi:
            raise BusinessRuleException(
                f"Conflict of interest detected. Reviewer {reviewer_id} cannot review submission {submission_id}."
            )
        
        # Validate review data
        if not review_data.get("summary") and not review_data.get("weaknesses") and not review_data.get("strengths"):
            # At least one of summary, weaknesses, or strengths should be provided
            if not review_data.get("answers"):
                raise BusinessRuleException(
                    "Review must contain at least summary, weaknesses, strengths, or answers"
                )
        
        # Check if review already exists
        existing = self.review_repo.get_review(submission_id, reviewer_id)
        if existing:
            # Update existing review
            review = self.review_repo.update_review(submission_id, reviewer_id, review_data)
        else:
            # Create new review
            review = self.review_repo.create_review(submission_id, reviewer_id, review_data)
        
        # Auto-update avg_score when review is submitted/updated
        try:
            decision_service = DecisionService(
                review_repo=self.review_repo,
                submission_repo=self.submission_repo,
                db=self.db
            )
            avg_score = decision_service.calculate_average_score(submission_id)
            # Only update avg_score if we have a valid score
            # Don't update final_score here - it's only set when Chair makes a decision
            if avg_score is not None:
                self.submission_repo.update(submission_id, {"avg_score": avg_score})
        except Exception as e:
            # Log error but don't fail the review submission
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to update avg_score for submission {submission_id}: {str(e)}")
        
        # Get answers if they exist
        answers = []
        if hasattr(review, 'answers') and review.answers:
            answers = [
                {
                    "question_id": ans.question_id,
                    "answer": ans.answer
                }
                for ans in review.answers
            ]
        
        return {
            "id": review.id,
            "submission_id": review.submission_id,
            "reviewer_id": review.reviewer_id,
            "summary": review.summary,
            "strengths": review.strengths,
            "weaknesses": review.weaknesses,
            "confidence": review.confidence,
            "recommendation": review.recommendation,
            "submitted_at": review.submitted_at if review.submitted_at else None,
            "best_paper_recommendation": review.best_paper_recommendation,
            "answers": answers if answers else None
        }
    
    def get_review(self, submission_id: int, reviewer_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific review.
        
        Args:
            submission_id: ID of the submission
            reviewer_id: ID of the reviewer
        
        Returns:
            Dict with review information, or None if not found
        """
        review = self.review_repo.get_review(submission_id, reviewer_id)
        if not review:
            return None
        
        # Get answers
        answers = []
        if hasattr(review, 'answers') and review.answers:
            answers = [
                {
                    "question_id": ans.question_id,
                    "answer": ans.answer
                }
                for ans in review.answers
            ]
        
        return {
            "id": review.id,
            "submission_id": review.submission_id,
            "reviewer_id": review.reviewer_id,
            "summary": review.summary,
            "strengths": review.strengths,
            "weaknesses": review.weaknesses,
            "confidence": review.confidence,
            "recommendation": review.recommendation,
            "submitted_at": review.submitted_at if review.submitted_at else None,
            "best_paper_recommendation": review.best_paper_recommendation,
            "score": float(review.score) if hasattr(review, 'score') and review.score is not None else None,
            "answers": answers if answers else None
        }
    
    def get_reviews_by_submission(self, submission_id: int) -> List[Dict[str, Any]]:
        """
        Get all reviews for a submission.
        
        Args:
            submission_id: ID of the submission
        
        Returns:
            List of review dictionaries
        """
        reviews = self.review_repo.get_reviews_by_submission(submission_id)
        result = []
        
        for r in reviews:
            # Get answers
            answers = []
            if hasattr(r, 'answers') and r.answers:
                answers = [
                    {
                        "question_id": ans.question_id,
                        "answer": ans.answer
                    }
                    for ans in r.answers
                ]
            
            result.append({
                "id": r.id,
                "submission_id": r.submission_id,
                "reviewer_id": r.reviewer_id,
                "summary": r.summary,
                "strengths": r.strengths,
                "weaknesses": r.weaknesses,
                "confidence": r.confidence,
                "recommendation": r.recommendation,
                "submitted_at": r.submitted_at if r.submitted_at else None,
                "best_paper_recommendation": r.best_paper_recommendation,
                "score": float(r.score) if hasattr(r, 'score') and r.score is not None else None,
                "answers": answers if answers else None
            })
        
        return result
