from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from infrastructure.databases.postgres import Base

class HistoryLogModel(Base):
    __tablename__ = "history_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(ForeignKey("users.id"))
    action = Column(String)
    description = Column(String)
    ip_address = Column(String)
    actor_role = Column(String)
    created_at = Column(DateTime, default=func.now())
    
class NotificationLogModel(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(ForeignKey("users.id"))
    type = Column(String)  # Thêm type
    content = Column(String)  # Đổi từ message thành content
    is_sent = Column(Boolean, default=False)  # Thêm is_sent
    created_at = Column(DateTime, default=func.now())

class ScheduleItemModel(Base):
    __tablename__ = "schedule_items"

    id = Column(Integer, primary_key=True)
    conference_id = Column(ForeignKey("conferences.id"))  # Giữ lại vì code đang dùng
    submission_id = Column(ForeignKey("submissions.id"))
    session_id = Column(ForeignKey("sessions.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    order_index = Column(Integer)

    session = relationship("SessionModel", back_populates="schedule_items")
    conference = relationship("ConferenceModel")
    submission = relationship("SubmissionModel")


class SystemSettingsModel(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True)

    smtp_host = Column(String)
    smtp_port = Column(Integer)
    smtp_user = Column(String)
    smtp_password = Column(String)
    smtp_from_email = Column(String)
    smtp_from_name = Column(String)

    quota_max_submissions_per_user = Column(Integer)
    quota_max_reviews_per_reviewer = Column(Integer)
    quota_max_file_size_mb = Column(Integer)

    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())