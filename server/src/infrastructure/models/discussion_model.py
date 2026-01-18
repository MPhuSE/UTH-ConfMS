from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from infrastructure.databases.postgres import Base


class SubmissionDiscussionMessageModel(Base):
    __tablename__ = "submission_discussions"

    id = Column(Integer, primary_key=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

