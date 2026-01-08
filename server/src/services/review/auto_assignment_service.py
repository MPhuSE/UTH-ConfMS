from typing import List, Dict, Any
from sqlalchemy.orm import Session
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from infrastructure.models.review_model import ReviewerExpertiseModel
from infrastructure.models.submission_model import SubmissionModel
from services.ai.ai_service import AIServiceManager
from services.review.assignment_service import AssignmentService
from domain.exceptions import NotFoundError, BusinessRuleException


class AutoAssignmentService:
    """Service for automatic reviewer assignment based on expertise and similarity."""
    
    def __init__(
        self,
        review_repo: ReviewRepository,
        submission_repo: SubmissionRepository,
        assignment_service: AssignmentService,
        ai_service: AIServiceManager,
        db: Session
    ):
        self.review_repo = review_repo
        self.submission_repo = submission_repo
        self.assignment_service = assignment_service
        self.ai_service = ai_service
        self.db = db
    
    def auto_assign_reviewers(
        self,
        submission_id: int,
        max_reviewers: int = 3,
        min_similarity: float = 0.3
    ) -> List[Dict[str, Any]]:
        """Automatically assign reviewers to a submission based on expertise."""
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        # Get submission keywords from abstract
        submission_text = submission.abstract or submission.title
        
        # Get all reviewers with expertise
        reviewer_expertise = self.db.query(ReviewerExpertiseModel).all()
        
        # Group by reviewer
        reviewer_keywords = {}
        for exp in reviewer_expertise:
            if exp.reviewer_id not in reviewer_keywords:
                reviewer_keywords[exp.reviewer_id] = []
            reviewer_keywords[exp.reviewer_id].append(exp.keyword)
        
        # Get AI suggestions
        suggestions = self.ai_service.suggest_reviewer_assignments(
            submission_abstract=submission_text,
            reviewer_keywords=reviewer_keywords
        )
        
        # Filter by minimum similarity and check COI
        assignments = []
        for suggestion in suggestions:
            if suggestion["similarity_score"] < min_similarity:
                continue
            
            reviewer_id = suggestion["reviewer_id"]
            
            # Check COI
            has_coi = self.review_repo.check_coi(submission_id, reviewer_id)
            if has_coi:
                continue
            
            # Check if already assigned
            existing_assignments = self.review_repo.get_assignments_by_submission(submission_id)
            if any(a.reviewer_id == reviewer_id for a in existing_assignments):
                continue
            
            # Assign reviewer
            try:
                assignment = self.assignment_service.assign_reviewer(
                    submission_id=submission_id,
                    reviewer_id=reviewer_id,
                    auto_assigned=True,
                    check_coi=False  # Already checked
                )
                assignments.append(assignment)
                
                if len(assignments) >= max_reviewers:
                    break
            except Exception as e:
                # Skip if assignment fails
                continue
        
        return assignments

