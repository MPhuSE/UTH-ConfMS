from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from infrastructure.repositories_interfaces.user_repository import UserRepository
from infrastructure.security.password_hash import Hasher
from infrastructure.models.user_model import UserModel, RoleModel
from domain.exceptions import DuplicateUserError, InitialChairExistsError


class CreateInitialChairService:
    CHAIR_ROLE_ID = 2
    ADMIN_ROLE_ID = 1

    def __init__(self, user_repo: UserRepository, db_session: AsyncSession):
        self.user_repo = user_repo
        self.db_session = db_session

    async def _get_or_create_role(self, role_id: int, name: str) -> RoleModel:
        role = await self.db_session.get(RoleModel, role_id)
        if role is None:
            role = RoleModel(id=role_id, name=name)
            self.db_session.add(role)
            await self.db_session.flush()
        return role

    async def create_chair(self, full_name: str, email: str, password: str) -> UserModel:
        existing_chair = await self.user_repo.get_user_by_role(self.CHAIR_ROLE_ID)
        if existing_chair:
            raise InitialChairExistsError("Tài khoản Chair đã được khởi tạo.")

        if await self.user_repo.get_by_email(email):
            raise DuplicateUserError(f"Email '{email}' đã tồn tại.")

        hashed_password = Hasher.hash_password(password)

        chair_role = await self._get_or_create_role(self.CHAIR_ROLE_ID, "chair")
        admin_role = await self._get_or_create_role(self.ADMIN_ROLE_ID, "admin")

        new_chair = UserModel(
            full_name=full_name,
            email=email,
            hashed_password=hashed_password,
            affiliation="Conference Chair",
            is_verified=True,
            is_active=True,
            created_at=datetime.utcnow(),
        )

        new_chair.roles.extend([chair_role, admin_role])

        self.db_session.add(new_chair)
        await self.db_session.commit()
        await self.db_session.refresh(new_chair)

        return new_chair

