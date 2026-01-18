from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func, UniqueConstraint
from infrastructure.databases.postgres import Base


class RebuttalModel(Base):
    __tablename__ = "rebuttals"

    id = Column(Integer, primary_key=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("submission_id", name="uq_rebuttals_submission_id"),
    )

