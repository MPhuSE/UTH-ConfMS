from typing import List, Dict, Any
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from domain.exceptions import NotFoundError
from sqlalchemy.orm import Session


class BiddingService:
    """Service for managing reviewer bidding."""
    
    def __init__(
        self,
        review_repo: ReviewRepository,
        db: Session
    ):
        self.review_repo = review_repo
        self.db = db
    
    def place_bid(
        self,
        submission_id: int,
        reviewer_id: int,
        bid: str  # "Yes", "No", "Maybe"
    ) -> Dict[str, Any]:
        """Place a bid on a submission."""
        bid_model = self.review_repo.create_bid(submission_id, reviewer_id, bid)
        
        return {
            "submission_id": bid_model.submission_id,
            "reviewer_id": bid_model.reviewer_id,
            "bid": bid_model.bid
        }
    
    def get_bids_by_reviewer(self, reviewer_id: int) -> List[Dict[str, Any]]:
        """Get all bids by a reviewer."""
        bids = self.review_repo.get_bids_by_reviewer(reviewer_id)
        return [
            {
                "submission_id": b.submission_id,
                "reviewer_id": b.reviewer_id,
                "bid": b.bid
            }
            for b in bids
        ]
    
    def get_bids_by_submission(self, submission_id: int) -> List[Dict[str, Any]]:
        """Get all bids for a submission."""
        bids = self.review_repo.get_bids_by_submission(submission_id)
        return [
            {
                "submission_id": b.submission_id,
                "reviewer_id": b.reviewer_id,
                "bid": b.bid
            }
            for b in bids
        ]

