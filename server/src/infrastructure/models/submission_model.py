from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import NUMERIC
from infrastructure.databases.postgres import Base
from sqlalchemy.dialects.postgresql import JSONB

class SubmissionModel(Base):
    """Thông tin chính về bài nộp."""
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(ForeignKey("tracks.id"), nullable=False)
    
    # Paper Info
    title = Column(String, nullable=False)
    abstract = Column(String)
    
    # Status & Score
    status = Column(String) 
    is_withdrawn = Column(Boolean, default=False)
    avg_score = Column(NUMERIC(19, 2)) 
    
    # Links
    camera_ready_submission = Column(Integer, ForeignKey("submission_files.id")) 
    
    # Relationships
    track = relationship("TrackModel", back_populates="submissions")
    authors = relationship("SubmissionAuthorModel", back_populates="submission", lazy="selectin")
    files = relationship(
        "SubmissionFileModel", 
        back_populates="submission", 
        lazy="selectin",
        foreign_keys="SubmissionFileModel.submission_id"
    )
    camera_ready_file = relationship(
        "SubmissionFileModel",
        foreign_keys="SubmissionModel.camera_ready_submission",
        uselist=False,
        post_update=True
    )
    
class SubmissionAuthorModel(Base):
    """Liên kết Tác giả và Bài nộp."""
    __tablename__ = "submission_authors"
    submission_id = Column(ForeignKey("submissions.id"), primary_key=True)
    user_id = Column(ForeignKey("users.id"), primary_key=True)
    order_index = Column(Integer)
    is_corresponding = Column(Boolean)
    country = Column(String)
    
    submission = relationship("SubmissionModel", back_populates="authors")
    user = relationship("UserModel") 

class SubmissionFileModel(Base):
    """Chi tiết về các file của bài nộp."""
    __tablename__ = "submission_files"
    id = Column(Integer, primary_key=True)
    submission_id = Column(ForeignKey("submissions.id"), nullable=False)
    
    file_path = Column(String, nullable=False)
    mime_type = Column(String)
    write_type = Column(String) 
    version = Column(Integer)
    submission = relationship(
        "SubmissionModel", 
        back_populates="files",
        foreign_keys="SubmissionFileModel.submission_id"
    )