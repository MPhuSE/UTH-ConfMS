from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from infrastructure.databases.postgres import Base

class ConferenceModel(Base):
    """Thông tin chính về Hội nghị."""
    __tablename__ = "conferences"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    abbreviation = Column(String)
    description = Column(String)
    website_url = Column(String)  # Tạm thời giữ website_url cho đến khi migration chạy xong
    # website = Column(String)  # Sẽ được dùng sau migration - comment để tránh SQLAlchemy query
    # location = Column(String)  # Sẽ được dùng sau migration - comment để tránh SQLAlchemy query

    start_date = Column(DateTime)
    end_date = Column(DateTime)
    submission_deadline = Column(DateTime)
    review_deadline = Column(DateTime)

    # TP5/TP7 workflow windows
    rebuttal_open = Column(Boolean, default=False)
    rebuttal_deadline = Column(DateTime, nullable=True)
    camera_ready_open = Column(Boolean, default=False)
    camera_ready_deadline = Column(DateTime, nullable=True)
    
    # Blind mode: single, double, open
    double_blind = Column(Boolean, default=True)  # Tạm thời giữ double_blind cho đến khi migration chạy xong
    # blind_mode = Column(String, default="double")  # Sẽ được dùng sau migration - comment để tránh SQLAlchemy query
    is_open = Column(Boolean, default=True)
    

    tracks = relationship("TrackModel", back_populates="conference", lazy="selectin")
    email_templates = relationship("EmailTemplateModel", back_populates="conference")
    sessions = relationship("SessionModel", back_populates="conference")
    
class TrackModel(Base):
    """Các chủ đề/track của Hội nghị."""
    __tablename__ = "tracks"
    id = Column(Integer, primary_key=True)
    conference_id = Column(ForeignKey("conferences.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)  # Thêm description
    max_reviewers = Column(Integer, default=3)
    

    conference = relationship("ConferenceModel", back_populates="tracks")
    submissions = relationship("SubmissionModel", back_populates="track", lazy="selectin")

class EmailTemplateModel(Base):
    """Mẫu email có thể tùy chỉnh."""
    __tablename__ = "email_templates"
    id = Column(Integer, primary_key=True)
    conference_id = Column(ForeignKey("conferences.id"), nullable=False)
    name = Column(String, nullable=False) 
    subject = Column(String)
    body = Column(String)

    conference = relationship("ConferenceModel", back_populates="email_templates")

class SessionModel(Base):
    """Tên bảng là sessions trong ERD, có thể là Sessions."""
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    conference_id = Column(ForeignKey("conferences.id"), nullable=False)
    name = Column(String, nullable=False)
    room = Column(String)  # Thêm room
    conference = relationship("ConferenceModel", back_populates="sessions")
    schedule_items = relationship("ScheduleItemModel", back_populates="session", lazy="selectin")

from infrastructure.models import submission_model  