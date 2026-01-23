from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from infrastructure.models.submission_model import SubmissionModel
from infrastructure.models.review_model import ReviewModel
from domain.exceptions import NotFoundError, BusinessRuleException


class DecisionService:
    """Service for managing submission decisions."""
    
    def __init__(
        self,
        review_repo: ReviewRepository,
        submission_repo: SubmissionRepository,
        db: Session
    ):
        self.review_repo = review_repo
        self.submission_repo = submission_repo
        self.db = db
    
    def calculate_average_score(self, submission_id: int) -> Optional[float]:
        """Calculate average score from all reviews."""
        reviews = self.review_repo.get_reviews_by_submission(submission_id)
        if not reviews:
            return None
        
        # Get scores from review answers (assuming there's a score question)
        scores = []
        for review in reviews:
            for answer in review.answers:
                # Assuming question_id 1 is the score question
                if answer.question_id == 1:  # Adjust based on your schema
                    try:
                        score = float(answer.answer)
                        scores.append(score)
                    except (ValueError, TypeError):
                        pass
        
        if not scores:
            return None
        
        return sum(scores) / len(scores)
    
    def make_decision(
        self,
        submission_id: int,
        decision: str,  # "accept" / "reject" / ...
        decision_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Make a decision on a submission."""
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        # Calculate average score
        avg_score = self.calculate_average_score(submission_id)
        
        normalized = (decision or "").strip().lower()
        norm_map = {
            "accept": "accepted",
            "accepted": "accepted",
            "reject": "rejected",
            "rejected": "rejected",
            "minor revision": "minor_revision",
            "minor_revision": "minor_revision",
            "major revision": "major_revision",
            "major_revision": "major_revision",
        }
        normalized = norm_map.get(normalized, normalized)
        if normalized not in ("accepted", "rejected", "minor_revision", "major_revision"):
            raise BusinessRuleException("Invalid decision value")

        # Map decision to appropriate status
        # Theo SUBMISSION_WORKFLOW.md - Section 3: Decision (Quyết Định)
        # Status values: submitted, under_review, accepted, rejected, withdrawn
        # Decision values: accepted, rejected, minor_revision, major_revision
        # 
        # Mapping decision → status:
        # - decision = "accepted" → status = "accepted"
        # - decision = "rejected" → status = "rejected"
        # - decision = "minor_revision" → status = "under_review" (để tác giả sửa)
        # - decision = "major_revision" → status = "under_review" (để tác giả sửa)
        status_map = {
            "accepted": "accepted",      # Decision accepted → Status accepted
            "rejected": "rejected",      # Decision rejected → Status rejected
            "minor_revision": "under_review",  # Revision needed → Keep under review
            "major_revision": "under_review"   # Revision needed → Keep under review
        }
        new_status = status_map.get(normalized, "under_review")

        # Update submission: decision và status được set riêng biệt
        # Quan trọng: Status và Decision là 2 trường riêng biệt, không phải luôn giống nhau!
        update_data = {
            "decision": normalized,       # Decision: accepted/rejected/minor_revision/major_revision
            "status": new_status,         # Status: accepted/rejected/under_review
            "avg_score": avg_score
        }
        if decision_notes:
            update_data["decision_notes"] = decision_notes
        
        updated = self.submission_repo.update(submission_id, update_data)
        
        return {
            "submission_id": updated.id,
            "status": updated.status,
            "decision": getattr(updated, "decision", None) or updated.status,
            "avg_score": float(avg_score) if avg_score else None,
            "decision_notes": getattr(updated, 'decision_notes', None)
        }
    
    def get_decisions_by_conference(self, conference_id: int) -> List[Dict[str, Any]]:
        """Get all decisions for a conference."""
        # This would need to filter submissions by conference
        # For now, we'll get all submissions
        submissions = self.submission_repo.get_all()
        
        decisions = []
        for submission in submissions:
            # Check if submission belongs to conference (would need conference_id in submission)
            if hasattr(submission, 'track') and submission.track:
                if submission.track.conference_id == conference_id:
                    avg_score = self.calculate_average_score(submission.id)
                    decisions.append({
                        "submission_id": submission.id,
                        "title": submission.title,
                        "status": submission.status,
                        "decision": getattr(submission, "decision", None) or submission.status,
                        "avg_score": float(avg_score) if avg_score else None
                    })
        
        return decisions
    
    def get_decision_statistics(self, conference_id: int) -> Dict[str, Any]:
        """Get decision statistics for a conference."""
        decisions = self.get_decisions_by_conference(conference_id)
        
        total = len(decisions)
        accepted = len([d for d in decisions if (d.get("status") or "").lower() in ("accepted", "accept")])
        rejected = len([d for d in decisions if (d.get("status") or "").lower() in ("rejected", "reject")])
        
        acceptance_rate = (accepted / total * 100) if total > 0 else 0
        
        return {
            "total_submissions": total,
            "accepted": accepted,
            "rejected": rejected,
            "acceptance_rate": round(acceptance_rate, 2)
        }

