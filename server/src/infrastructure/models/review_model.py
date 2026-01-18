from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean, UniqueConstraint, and_
from sqlalchemy.orm import relationship
from infrastructure.databases.postgres import Base

class ReviewAssignmentModel(Base):
    """Phân công bài cho Reviewer."""
    __tablename__ = "review_assignments"
    
    submission_id = Column(ForeignKey("submissions.id"), primary_key=True)
    reviewer_id = Column(ForeignKey("users.id"), primary_key=True)
    
    auto_assigned = Column(Boolean, default=False)
    
    
    review = relationship(
        "ReviewModel", 
        primaryjoin="and_(ReviewAssignmentModel.submission_id == ReviewModel.submission_id, "
                    "ReviewAssignmentModel.reviewer_id == ReviewModel.reviewer_id)",
        foreign_keys="[ReviewModel.submission_id, ReviewModel.reviewer_id]",
        uselist=False,
        viewonly=True
    )

class ReviewModel(Base):
    """Nội dung bài đánh giá."""
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(ForeignKey("submissions.id"), nullable=False)
    reviewer_id = Column(ForeignKey("users.id"), nullable=False)
    
    confidence = Column(Integer)  # Thêm confidence
    summary = Column(String)
    strengths = Column(String)  # Đổi từ weakness thành strengths (số nhiều)
    weaknesses = Column(String)  # Thêm weaknesses
    recommendation = Column(String)  # enum: accept, weak_accept, borderline, weak_reject, reject
    best_paper_recommendation = Column(Boolean, default=False)
    submitted_at = Column(DateTime, default=func.now())  # Thêm submitted_at
    

    __table_args__ = (
        UniqueConstraint('submission_id', 'reviewer_id', name='uq_review_submission_reviewer'),
    )


    assignment = relationship(
        "ReviewAssignmentModel", 
        primaryjoin="and_(ReviewModel.submission_id == ReviewAssignmentModel.submission_id, "
                    "ReviewModel.reviewer_id == ReviewAssignmentModel.reviewer_id)",
        foreign_keys="[ReviewModel.submission_id, ReviewModel.reviewer_id]",
        uselist=False,
        viewonly=True
    )
    
    answers = relationship("ReviewAnswerModel", back_populates="review")

class ReviewQuestionModel(Base):
    """Bộ câu hỏi đánh giá."""
    __tablename__ = "review_question"
    id = Column(Integer, primary_key=True)
    conference_id = Column(ForeignKey("conferences.id"), nullable=False)  # Thêm conference_id
    question = Column(String, nullable=False)
    type = Column(String)  # enum: text, score, boolean
    required = Column(Boolean, default=True)

class ReviewAnswerModel(Base):
    """Câu trả lời cho các câu hỏi đánh giá."""
    __tablename__ = "review_answers"
    review_id = Column(ForeignKey("reviews.id"), primary_key=True)
    question_id = Column(ForeignKey("review_question.id"), primary_key=True)
    answer = Column(String) 
    review = relationship("ReviewModel", back_populates="answers")
    question = relationship("ReviewQuestionModel")
    
class ConflictOfInterestModel(Base):
    """Ghi nhận COI giữa User và Submission."""
    __tablename__ = "conflicts_of_interest"
    submission_id = Column(ForeignKey("submissions.id"), primary_key=True)
    user_id = Column(ForeignKey("users.id"), primary_key=True)
    
    coi_type = Column(String) 
    detected_by_system = Column(Boolean, default=False)

class BiddingModel(Base):
    """Sở thích đánh giá của Reviewer."""
    __tablename__ = "bidding"
    submission_id = Column(ForeignKey("submissions.id"), primary_key=True)
    reviewer_id = Column(ForeignKey("users.id"), primary_key=True)
    
    bid = Column(String) 
    
class ReviewerExpertiseModel(Base):
    """Chuyên môn (keywords) của Reviewer."""
    __tablename__ = "reviewer_expertise"
    reviewer_id = Column(ForeignKey("users.id"), primary_key=True)
    keyword = Column(String, primary_key=True)
    level = Column(Integer)