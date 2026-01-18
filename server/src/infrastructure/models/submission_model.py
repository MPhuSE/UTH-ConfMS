from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import NUMERIC, JSONB
from infrastructure.databases.postgres import Base

class SubmissionModel(Base):
    """Thông tin chính về bài nộp."""
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(ForeignKey("tracks.id"), nullable=False)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False)
    
    # Paper Info
    title = Column(String, nullable=False)
    abstract = Column(String)
    decision = Column(String, nullable=True)
    
    # Status & Score
    status = Column(String) 
    is_withdrawn = Column(Boolean, default=False)
    avg_score = Column(NUMERIC(19, 2)) 
    
    # Links - Cột này nằm ở bảng submissions (BẢN CHUẨN)
    camera_ready_submission = Column(Integer, ForeignKey("submission_files.id", use_alter=True, name="fk_camera_ready"), nullable=True)
    
    # Relationships
    track = relationship("TrackModel", back_populates="submissions")
    
    authors = relationship(
        "SubmissionAuthorModel", 
        back_populates="submission", 
        lazy="selectin",
        cascade="all, delete-orphan" 
    )
    
    # Danh sách tất cả file (Bản thảo 1, 2, 3...)
    files = relationship(
        "SubmissionFileModel", 
        back_populates="submission", 
        lazy="selectin",
        foreign_keys="SubmissionFileModel.submission_id", # Chỉ định rõ lấy theo submission_id
        cascade="all, delete-orphan"
    )
    
    # Quan hệ riêng để lấy Duy nhất 1 file bản cuối
    camera_ready_file = relationship(
        "SubmissionFileModel",
        foreign_keys=[camera_ready_submission],
        post_update=True
    )

    @property
    def file_path(self):
        """Ưu tiên lấy file camera ready, nếu không có lấy file mới nhất."""
        if self.camera_ready_file:
            return self.camera_ready_file.file_path
        if self.files:
            latest_file = max(self.files, key=lambda f: f.id)
            return latest_file.file_path
        return None

class SubmissionAuthorModel(Base):
    __tablename__ = "submission_authors"
    submission_id = Column(ForeignKey("submissions.id"), primary_key=True)
    user_id = Column(ForeignKey("users.id"), primary_key=True)
    order_index = Column(Integer)
    is_corresponding = Column(Boolean)
    full_name = Column(String) 
    email = Column(String) 

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
        foreign_keys=[submission_id] # Ràng buộc rõ ràng
    )