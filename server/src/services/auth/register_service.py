
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from infrastructure.repositories_interfaces.user_repository import UserRepository
from infrastructure.security.password_hash import Hasher
from infrastructure.security.jwt import JWTService
from infrastructure.email.email_service import EmailService
from infrastructure.models.user_model import UserModel, RoleModel
from domain.exceptions import DuplicateUserError


class RegisterService:
    DEFAULT_AUTHOR_ROLE_ID = 4
    REVIEWER_ROLE_ID = 3

    def __init__(
        self, 
        user_repo: UserRepository, 
        db_session: AsyncSession,
        jwt_service: JWTService = None,
        email_service: EmailService = None
    ):
        self.user_repo = user_repo
        self.db_session = db_session
        self.jwt_service = jwt_service or JWTService()
        self.email_service = email_service or EmailService()

    async def _get_or_create_role(self, role_id: int, name: str) -> RoleModel:
        role = await self.db_session.get(RoleModel, role_id)
        if role is None:
            role = RoleModel(id=role_id, name=name)
            self.db_session.add(role)
            await self.db_session.flush()
        return role

    async def register_new_user(
        self, full_name: str, email: str, password: str
    ) -> UserModel:
        if await self.user_repo.get_by_email(email):
            raise DuplicateUserError(f"Email '{email}' đã tồn tại.")

        hashed_password = Hasher.hash_password(password) 

        new_user = UserModel(
            full_name=full_name,
            email=email,
            hashed_password=hashed_password,
            is_verified=False,
            is_active=True,
            created_at=datetime.utcnow(),
        )

        author_role = await self._get_or_create_role(self.DEFAULT_AUTHOR_ROLE_ID, "author")
        new_user.roles.append(author_role)
        
        self.db_session.add(new_user)
        await self.db_session.commit()
        await self.db_session.refresh(new_user)

        # Tạo token xác thực email và gửi email
        verification_token = self.jwt_service.create_email_verification_token(new_user.id)
        email_sent = await self.email_service.send_verification_email(new_user.email, verification_token)
        
        if not email_sent:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Không thể gửi email xác thực cho user {new_user.email}. Token: {verification_token}")

        return new_user