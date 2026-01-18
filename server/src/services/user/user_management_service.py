from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from infrastructure.repositories_interfaces.user_repository import UserRepository
from infrastructure.models.user_model import UserModel, RoleModel
from infrastructure.security.password_hash import Hasher
from domain.exceptions import DuplicateUserError, NotFoundError


class UserManagementService:
    def __init__(self, user_repo: UserRepository, db_session: AsyncSession):
        self.user_repo = user_repo
        self.db_session = db_session

    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[UserModel]:
        """Lấy danh sách tất cả người dùng."""
        return await self.user_repo.get_all(skip=skip, limit=limit)

    async def search_users(self, query: str, limit: int = 10) -> List[UserModel]:
        """Tìm kiếm người dùng theo email hoặc tên."""
        return await self.user_repo.search_users(query=query, limit=limit)

    async def get_user_by_id(self, user_id: int) -> UserModel:
        """Lấy thông tin người dùng theo ID."""
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(f"Người dùng với ID {user_id} không tồn tại.")
        return user

    async def create_user(
        self,
        email: str,
        password: str,
        full_name: Optional[str] = None,
        affiliation: Optional[str] = None,
        phone_number: Optional[str] = None,
        website_url: Optional[str] = None,
        is_active: bool = True,
        is_verified: bool = False,
        role_ids: Optional[List[int]] = None,
    ) -> UserModel:
        """Tạo người dùng mới."""
        # Kiểm tra email đã tồn tại chưa
        existing_user = await self.user_repo.get_by_email(email)
        if existing_user:
            raise DuplicateUserError(f"Email '{email}' đã tồn tại.")

        # Hash password
        hashed_password = Hasher.hash_password(password)

        # Tạo user model
        new_user = UserModel(
            email=email,
            # populate both fields so old code and new fields are consistent
            hashed_password=hashed_password,
            password_hash=hashed_password,
            full_name=full_name,
            affiliation=affiliation,
            phone_number=phone_number,
            website_url=website_url,
            is_active=is_active,
            is_verified=is_verified,
            created_at=datetime.utcnow(),
        )

        # Gán roles nếu có
        if role_ids:
            for role_id in role_ids:
                role = await self.db_session.get(RoleModel, role_id)
                if role:
                    new_user.roles.append(role)

        # Lưu user
        user = await self.user_repo.create(new_user)
        await self.db_session.commit()
        await self.db_session.refresh(user)
        return user

    async def update_user(
        self,
        user_id: int,
        full_name: Optional[str] = None,
        affiliation: Optional[str] = None,
        phone_number: Optional[str] = None,
        website_url: Optional[str] = None,
        is_active: Optional[bool] = None,
        is_verified: Optional[bool] = None,
    ) -> UserModel:
        """Cập nhật thông tin người dùng (admin)."""
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(f"Người dùng với ID {user_id} không tồn tại.")

        # Cập nhật các trường nếu được cung cấp
        if full_name is not None:
            user.full_name = full_name
        if affiliation is not None:
            user.affiliation = affiliation
        if phone_number is not None:
            user.phone_number = phone_number
        if website_url is not None:
            user.website_url = website_url
        if is_active is not None:
            user.is_active = is_active
        if is_verified is not None:
            user.is_verified = is_verified

        updated_user = await self.user_repo.update(user)
        await self.db_session.commit()
        await self.db_session.refresh(updated_user)
        return updated_user

    async def update_profile(
        self,
        user_id: int,
        full_name: Optional[str] = None,
        affiliation: Optional[str] = None,
        phone_number: Optional[str] = None,
        website_url: Optional[str] = None,
        avatar_url: Optional[str] = None,
    ) -> UserModel:
        """Cập nhật profile bởi chính user."""
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(f"Người dùng với ID {user_id} không tồn tại.")

        if full_name is not None:
            user.full_name = full_name
        if affiliation is not None:
            user.affiliation = affiliation
        if phone_number is not None:
            user.phone_number = phone_number
        if website_url is not None:
            user.website_url = website_url
        if avatar_url is not None:
            user.avatar_url = avatar_url

        updated_user = await self.user_repo.update(user)
        await self.db_session.commit()
        await self.db_session.refresh(updated_user)
        return updated_user

    async def update_user_password(self, user_id: int, new_password: str) -> None:
        """Cập nhật mật khẩu người dùng."""
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(f"Người dùng với ID {user_id} không tồn tại.")

        hashed_password = Hasher.hash_password(new_password)
        user.hashed_password = hashed_password
        user.password_hash = hashed_password
        await self.user_repo.update(user)
        await self.db_session.commit()

    async def delete_user(self, user_id: int) -> None:
        """Xóa người dùng."""
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(f"Người dùng với ID {user_id} không tồn tại.")

        await self.user_repo.delete(user_id)
        await self.db_session.commit()

    async def add_role_to_user(self, user_id: int, role_id: int) -> UserModel:
        """Thêm role cho người dùng."""
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(f"Người dùng với ID {user_id} không tồn tại.")

        role = await self.db_session.get(RoleModel, role_id)
        if role is None:
            raise NotFoundError(f"Role với ID {role_id} không tồn tại.")

        if role not in user.roles:
            user.roles.append(role)
            await self.user_repo.update(user)
            await self.db_session.commit()
            await self.db_session.refresh(user)

        return user

    async def remove_role_from_user(self, user_id: int, role_id: int) -> UserModel:
        """Xóa role khỏi người dùng."""
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(f"Người dùng với ID {user_id} không tồn tại.")

        role = await self.db_session.get(RoleModel, role_id)
        if role is None:
            raise NotFoundError(f"Role với ID {role_id} không tồn tại.")

        if role in user.roles:
            user.roles.remove(role)
            await self.user_repo.update(user)
            await self.db_session.commit()
            await self.db_session.refresh(user)

        return user

