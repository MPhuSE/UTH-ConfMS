from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from infrastructure.models.review_model import ReviewModel, ReviewAssignmentModel, ReviewAnswerModel, ConflictOfInterestModel, BiddingModel


class ReviewRepository(ABC):
    """Repository interface for Review operations."""
    
    @abstractmethod
    def create_assignment(self, submission_id: int, reviewer_id: int, auto_assigned: bool = False) -> ReviewAssignmentModel:
        """Assign a reviewer to a submission."""
        pass
    
    @abstractmethod
    def get_assignments_by_submission(self, submission_id: int) -> List[ReviewAssignmentModel]:
        """Get all assignments for a submission."""
        pass
    
    @abstractmethod
    def get_assignments_by_reviewer(self, reviewer_id: int) -> List[ReviewAssignmentModel]:
        """Get all assignments for a reviewer."""
        pass
    
    @abstractmethod
    def remove_assignment(self, submission_id: int, reviewer_id: int) -> None:
        """Remove an assignment."""
        pass
    
    @abstractmethod
    def create_review(self, submission_id: int, reviewer_id: int, data: Dict[str, Any]) -> ReviewModel:
        """Create a review."""
        pass
    
    @abstractmethod
    def get_review(self, submission_id: int, reviewer_id: int) -> Optional[ReviewModel]:
        """Get a specific review."""
        pass
    
    @abstractmethod
    def get_reviews_by_submission(self, submission_id: int) -> List[ReviewModel]:
        """Get all reviews for a submission."""
        pass
    
    @abstractmethod
    def update_review(self, submission_id: int, reviewer_id: int, data: Dict[str, Any]) -> ReviewModel:
        """Update a review."""
        pass
    
    @abstractmethod
    def create_coi(self, submission_id: int, user_id: int, coi_type: str, detected_by_system: bool = False) -> ConflictOfInterestModel:
        """Create a conflict of interest record."""
        pass
    
    @abstractmethod
    def get_cois_by_submission(self, submission_id: int) -> List[ConflictOfInterestModel]:
        """Get all COIs for a submission."""
        pass
    
    @abstractmethod
    def get_cois_by_user(self, user_id: int) -> List[ConflictOfInterestModel]:
        """Get all COIs for a user."""
        pass
    
    @abstractmethod
    def check_coi(self, submission_id: int, user_id: int) -> bool:
        """Check if there's a COI between user and submission."""
        pass
    
    @abstractmethod
    def create_bid(self, submission_id: int, reviewer_id: int, bid: str) -> BiddingModel:
        """Create a bid."""
        pass
    
    @abstractmethod
    def get_bids_by_reviewer(self, reviewer_id: int) -> List[BiddingModel]:
        """Get all bids by a reviewer."""
        pass
    
    @abstractmethod
    def get_bids_by_submission(self, submission_id: int) -> List[BiddingModel]:
        """Get all bids for a submission."""
        pass

