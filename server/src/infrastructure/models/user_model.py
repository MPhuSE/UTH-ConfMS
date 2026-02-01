from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey, Table
from sqlalchemy.orm import relationship, Mapped, mapped_column
from infrastructure.databases.postgres import Base
from sqlalchemy.dialects.postgresql import JSONB
import enum


class RoleModel(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)


class UserRoleModel(Base):
    __tablename__ = "user_roles"
    user_id = Column(ForeignKey("users.id"), primary_key=True)
    role_id = Column(ForeignKey("roles.id"), primary_key=True)


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    affiliation = Column(String)
    phone_number = Column(String)
    website_url = Column(String)
    avatar_url = Column(String)      
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    roles = relationship("RoleModel", secondary="user_roles", backref="users", lazy="selectin")
    refresh_token_hash = Column(String(255), nullable=True, index=True)
    refresh_token_expires_at = Column(DateTime, nullable=True)
    
    tenant_memberships = relationship("TenantMemberModel", back_populates="user", lazy="selectin")
    
    # SSO Support
    sso_provider = Column(String, nullable=True)
    sso_id = Column(String, nullable=True)

    @property
    def role_names(self) -> list[str]:
        return [role.name for role in self.roles] if self.roles else []
    def to_domain_model(self):
        from domain.models.user import User 
        
        return User( 
            id=self.id,
            email=self.email,
            full_name=self.full_name,
            affiliation=self.affiliation,
            phone_number=self.phone_number,
            website_url=self.website_url,
            is_verified=self.is_verified,
            is_active=self.is_active,
            last_login=self.last_login,
            created_at=self.created_at,
            roles=self.role_names,
            sso_provider=self.sso_provider,
            sso_id=self.sso_id
        )