from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from infrastructure.security.jwt import JWTService
from infrastructure.repositories_interfaces.user_repository import UserRepository
from services.email.email_service import EmailService
from services.email.email_templates import EmailTemplates
from domain.exceptions import AuthenticationError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthCommunicationService:
    def __init__(
        self,
        user_repo: UserRepository,
        db: AsyncSession,
        jwt: JWTService,
        email: EmailService
    ):
        self.user_repo = user_repo
        self.db = db
        self.jwt = jwt
        self.email = email

    async def resend_verification_email(self, email: str):
        user = await self.user_repo.get_by_email(email)
        if not user or user.is_verified:
            raise AuthenticationError("Email không hợp lệ")

        token = self.jwt.create_email_verification_token(user.id)
        html = EmailTemplates.verify_email(token)

        await self.email.send(user.email, "Xác thực tài khoản", html)

    async def request_password_reset(self, email: str):
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise AuthenticationError("Email không tồn tại")

        token = self.jwt.create_password_reset_token(user.id)
        html = EmailTemplates.reset_password(token)

        await self.email.send(user.email, "Khôi phục mật khẩu", html)

    async def reset_password(self, token: str, new_password: str):
        payload = self.jwt.decode_token(token)
        if payload["sub"] != "password_reset":
            raise AuthenticationError("Token không hợp lệ")

        user = await self.user_repo.get_by_id(payload["user_id"])
        new_hashed = pwd_context.hash(new_password)
        user.hashed_password = new_hashed
        await self.db.commit()

    async def send_user_document(
        self,
        user_id: int,
        title: str,
        content: str,
        file_path: str
    ):
        user = await self.user_repo.get_by_id(user_id)
        html = EmailTemplates.notification(content)
        await self.email.send(user.email, title, html, file_path)
    async def verify_email(self, token: str) -> bool:
        try:
            # 1. Decode token
            payload = self.jwt.decode_token(token)
            
            # 2. Kiểm tra loại token (Phải khớp với sub trong JWTService)
            if payload.get("sub") != "email_verification":
                raise AuthenticationError("Token xác thực không hợp lệ")
            
            # 3. Tìm user
            user = await self.user_repo.get_by_id(payload["user_id"])
            if not user:
                raise AuthenticationError("Người dùng không tồn tại")
            
            # 4. Nếu đã xác thực rồi thì thôi
            if user.is_verified:
                return True

            # 5. Cập nhật trạng thái
            user.is_verified = True
            
            # QUAN TRỌNG: Phải commit để lưu vào database
            await self.db.commit()
            await self.db.refresh(user) # Làm mới dữ liệu user từ DB
            return True
            
        except Exception as e:
            # Nếu có lỗi thì rollback để tránh treo transaction
            await self.db.rollback()
            raise AuthenticationError(f"Xác thực thất bại: {str(e)}")