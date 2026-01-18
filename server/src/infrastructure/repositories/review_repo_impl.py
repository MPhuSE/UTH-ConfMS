from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from infrastructure.models.review_model import (
    ReviewModel, ReviewAssignmentModel, ReviewAnswerModel, 
    ConflictOfInterestModel, BiddingModel, ReviewQuestionModel
)
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.models.submission_model import SubmissionModel, SubmissionAuthorModel


class ReviewRepositoryImpl(ReviewRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def create_assignment(self, submission_id: int, reviewer_id: int, auto_assigned: bool = False) -> ReviewAssignmentModel:
        assignment = ReviewAssignmentModel(
            submission_id=submission_id,
            reviewer_id=reviewer_id,
            auto_assigned=auto_assigned
        )
        self.db.add(assignment)
        self.db.commit()
        self.db.refresh(assignment)
        return assignment
    
    def get_assignments_by_submission(self, submission_id: int) -> List[ReviewAssignmentModel]:
        return self.db.query(ReviewAssignmentModel).filter(
            ReviewAssignmentModel.submission_id == submission_id
        ).all()
    
    def get_assignments_by_reviewer(self, reviewer_id: int) -> List[ReviewAssignmentModel]:
        return self.db.query(ReviewAssignmentModel).filter(
            ReviewAssignmentModel.reviewer_id == reviewer_id
        ).all()
    
    def remove_assignment(self, submission_id: int, reviewer_id: int) -> None:
        assignment = self.db.query(ReviewAssignmentModel).filter(
            and_(
                ReviewAssignmentModel.submission_id == submission_id,
                ReviewAssignmentModel.reviewer_id == reviewer_id
            )
        ).first()
        if assignment:
            self.db.delete(assignment)
            self.db.commit()
    
    def create_review(self, submission_id: int, reviewer_id: int, data: Dict[str, Any]) -> ReviewModel:
        review = ReviewModel(
            submission_id=submission_id,
            reviewer_id=reviewer_id,
            summary=data.get('summary'),
            strengths=data.get('strengths'),
            weaknesses=data.get('weaknesses'),  # Đổi từ weakness thành weaknesses
            confidence=data.get('confidence'),
            recommendation=data.get('recommendation'),
            best_paper_recommendation=data.get('best_paper_recommendation', False)
        )
        self.db.add(review)
        self.db.flush()
        
        # Add answers if provided
        if 'answers' in data and data['answers']:
            for answer_data in data['answers']:
                # Check if question exists before adding answer
                question = self.db.query(ReviewQuestionModel).filter(
                    ReviewQuestionModel.id == answer_data['question_id']
                ).first()
                if question:
                    answer = ReviewAnswerModel(
                        review_id=review.id,
                        question_id=answer_data['question_id'],
                        answer=answer_data['answer']
                    )
                    self.db.add(answer)
                else:
                    # Log warning but don't fail - question might not exist
                    import logging
                    logging.warning(f"Question {answer_data['question_id']} not found, skipping answer")
        
        self.db.commit()
        self.db.refresh(review)
        return review
    
    def get_review(self, submission_id: int, reviewer_id: int) -> Optional[ReviewModel]:
        return self.db.query(ReviewModel).filter(
            and_(
                ReviewModel.submission_id == submission_id,
                ReviewModel.reviewer_id == reviewer_id
            )
        ).first()
    
    def get_reviews_by_submission(self, submission_id: int) -> List[ReviewModel]:
        return self.db.query(ReviewModel).filter(
            ReviewModel.submission_id == submission_id
        ).all()
    
    def update_review(self, submission_id: int, reviewer_id: int, data: Dict[str, Any]) -> ReviewModel:
        review = self.get_review(submission_id, reviewer_id)
        if not review:
            raise ValueError("Review not found")
        
        if 'summary' in data:
            review.summary = data['summary']
        if 'strengths' in data:
            review.strengths = data['strengths']
        if 'weaknesses' in data:
            review.weaknesses = data['weaknesses']  # Đổi từ weakness thành weaknesses
        if 'confidence' in data:
            review.confidence = data['confidence']
        if 'recommendation' in data:
            review.recommendation = data['recommendation']
        if 'best_paper_recommendation' in data:
            review.best_paper_recommendation = data['best_paper_recommendation']
        
        # Update answers
        if 'answers' in data:
            # Delete existing answers
            self.db.query(ReviewAnswerModel).filter(
                ReviewAnswerModel.review_id == review.id
            ).delete()
            
            # Add new answers
            for answer_data in data['answers']:
                # Check if question exists before adding answer
                question = self.db.query(ReviewQuestionModel).filter(
                    ReviewQuestionModel.id == answer_data['question_id']
                ).first()
                if question:
                    answer = ReviewAnswerModel(
                        review_id=review.id,
                        question_id=answer_data['question_id'],
                        answer=answer_data['answer']
                    )
                    self.db.add(answer)
                else:
                    # Log warning but don't fail - question might not exist
                    import logging
                    logging.warning(f"Question {answer_data['question_id']} not found, skipping answer")
        
        self.db.commit()
        self.db.refresh(review)
        return review
    
    def create_coi(self, submission_id: int, user_id: int, coi_type: str, detected_by_system: bool = False) -> ConflictOfInterestModel:
        coi = ConflictOfInterestModel(
            submission_id=submission_id,
            user_id=user_id,
            coi_type=coi_type,
            detected_by_system=detected_by_system
        )
        self.db.add(coi)
        self.db.commit()
        self.db.refresh(coi)
        return coi
    
    def get_cois_by_submission(self, submission_id: int) -> List[ConflictOfInterestModel]:
        return self.db.query(ConflictOfInterestModel).filter(
            ConflictOfInterestModel.submission_id == submission_id
        ).all()
    
    def get_cois_by_user(self, user_id: int) -> List[ConflictOfInterestModel]:
        return self.db.query(ConflictOfInterestModel).filter(
            ConflictOfInterestModel.user_id == user_id
        ).all()
    
    def check_coi(self, submission_id: int, user_id: int) -> bool:
        """
        Check if there's a COI between user and submission.
        
        This checks:
        1. Direct COI declarations in conflicts_of_interest table
        2. If user is an author of the submission (via submission_authors table)
        
        Returns:
            True if COI exists, False otherwise
        """
        # Check direct COI declarations
        direct_coi = self.db.query(ConflictOfInterestModel).filter(
            and_(
                ConflictOfInterestModel.submission_id == submission_id,
                ConflictOfInterestModel.user_id == user_id
            )
        ).first()
        if direct_coi:
            return True
        
        # Check if user is an author of the submission
        # This is the most common COI: reviewer cannot review their own paper
        author_coi = self.db.query(SubmissionAuthorModel).filter(
            and_(
                SubmissionAuthorModel.submission_id == submission_id,
                SubmissionAuthorModel.user_id == user_id
            )
        ).first()
        if author_coi:
            return True
        
        return False
    
    def create_bid(self, submission_id: int, reviewer_id: int, bid: str) -> BiddingModel:
        # Check if bid already exists
        existing = self.db.query(BiddingModel).filter(
            and_(
                BiddingModel.submission_id == submission_id,
                BiddingModel.reviewer_id == reviewer_id
            )
        ).first()
        
        if existing:
            existing.bid = bid
            self.db.commit()
            self.db.refresh(existing)
            return existing
        
        bid_model = BiddingModel(
            submission_id=submission_id,
            reviewer_id=reviewer_id,
            bid=bid
        )
        self.db.add(bid_model)
        self.db.commit()
        self.db.refresh(bid_model)
        return bid_model
    
    def get_bids_by_reviewer(self, reviewer_id: int) -> List[BiddingModel]:
        return self.db.query(BiddingModel).filter(
            BiddingModel.reviewer_id == reviewer_id
        ).all()
    
    def get_bids_by_submission(self, submission_id: int) -> List[BiddingModel]:
        return self.db.query(BiddingModel).filter(
            BiddingModel.submission_id == submission_id
        ).all()

