from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from infrastructure.databases.postgres import Base


class TenantModel(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    slug = Column(String, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    members = relationship("TenantMemberModel", back_populates="tenant", cascade="all, delete-orphan")


class TenantMemberModel(Base):
    __tablename__ = "tenant_members"

    tenant_id = Column(ForeignKey("tenants.id"), primary_key=True)
    user_id = Column(ForeignKey("users.id"), primary_key=True)
    role = Column(String, default="member")
    created_at = Column(DateTime, default=func.now())

    tenant = relationship("TenantModel", back_populates="members")
    user = relationship("UserModel")
