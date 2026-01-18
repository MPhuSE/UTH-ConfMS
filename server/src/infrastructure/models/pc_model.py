from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from infrastructure.databases.postgres import Base


class PCInvitationModel(Base):
    __tablename__ = "pc_invitations"

    id = Column(Integer, primary_key=True)
    conference_id = Column(ForeignKey("conferences.id"), nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False, default="reviewer")  # reviewer / chair
    token = Column(String, nullable=False, unique=True, index=True)
    status = Column(String, nullable=False, default="PENDING")  # PENDING/ACCEPTED/DECLINED/EXPIRED
    expires_at = Column(DateTime, nullable=True)
    invited_by = Column(ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())

    inviter = relationship("UserModel", foreign_keys=[invited_by])


class ConferencePCMemberModel(Base):
    __tablename__ = "conference_pc_members"

    conference_id = Column(ForeignKey("conferences.id"), primary_key=True)
    user_id = Column(ForeignKey("users.id"), primary_key=True)
    role = Column(String, nullable=False, default="reviewer")  # reviewer / chair
    created_at = Column(DateTime, default=func.now())

    user = relationship("UserModel")
