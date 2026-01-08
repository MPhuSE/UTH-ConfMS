
from typing import Optional, List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, update
from infrastructure.repositories_interfaces.user_repository import UserRepository
from infrastructure.models.user_model import UserModel, UserRoleModel, RoleModel


class UserRepositoryImpl(UserRepository):
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def get_by_id(self, user_id: int) -> Optional[UserModel]:
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[UserModel]:
        stmt = select(UserModel).where(UserModel.email == email)
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_role(self, role_id: int) -> List[UserModel]:
        stmt = (
            select(UserModel)
            .join(UserRoleModel)
            .where(UserRoleModel.role_id == role_id)
        )
        result = await self.db_session.execute(stmt)
        return list(result.scalars().all())

    async def save(self, user: UserModel) -> UserModel:
        self.db_session.add(user)
        await self.db_session.commit()
        await self.db_session.refresh(user)
        return user

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[UserModel]:
        """Lấy tất cả người dùng với phân trang."""
        stmt = select(UserModel).offset(skip).limit(limit)
        result = await self.db_session.execute(stmt)
        return list(result.scalars().all())

    async def delete(self, user_id: int) -> None:
        """Xóa người dùng."""
        stmt = delete(UserModel).where(UserModel.id == user_id)
        await self.db_session.execute(stmt)
        await self.db_session.commit()

    async def update(self, user: UserModel) -> UserModel:
        """Cập nhật người dùng."""
        stmt = (
            update(UserModel)
            .where(UserModel.id == user.id)
            .values(
                email=user.email,
                full_name=user.full_name,
                affiliation=user.affiliation,
                phone_number=user.phone_number,
                website_url=user.website_url,
                avatar_url=user.avatar_url,
                is_verified=user.is_verified,
                is_active=user.is_active
            )
        )
        await self.db_session.execute(stmt)
        await self.db_session.commit()
        await self.db_session.refresh(user)
        return user

    async def create(self, user: UserModel) -> UserModel:
        """Tạo người dùng mới."""
        self.db_session.add(user)
        await self.db_session.commit()
        await self.db_session.refresh(user)
        return user