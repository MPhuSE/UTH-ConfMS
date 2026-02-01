import smtplib
import asyncio
import logging
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional
from config import settings
from domain.exceptions import AuthenticationError

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self, db_session=None):
        """
        Initialize EmailService with SMTP configuration.
        Priority: Database (SystemSettings) > config.py > defaults
        """
        self.db_session = db_session
        # Initial config from settings, will be refreshed from DB in _execute_send
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = int(settings.SMTP_PORT)
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
        self.frontend_url = settings.FRONTEND_URL
    
    async def _get_db_settings(self):
        """Fetch settings from database (async-safe)"""
        if not self.db_session:
            return None
            
        try:
            from infrastructure.models.system_model import SystemSettingsModel
            if hasattr(self.db_session, 'query'):
                # Sync session
                return self.db_session.query(SystemSettingsModel).first()
            else:
                # Async session
                from sqlalchemy.future import select
                stmt = select(SystemSettingsModel)
                result = await self.db_session.execute(stmt)
                return result.scalar_one_or_none()
        except Exception as e:
            logger.warning(f"Could not load settings from DB: {e}")
            return None

    async def _ensure_config_loaded(self):
        """Ensure config is loaded from database prior to sending"""
        db_settings = await self._get_db_settings()
        
        if db_settings and db_settings.smtp_host:
            self.smtp_host = db_settings.smtp_host
            self.smtp_port = db_settings.smtp_port or int(settings.SMTP_PORT)
            self.smtp_user = db_settings.smtp_user
            self.smtp_password = db_settings.smtp_password
            self.from_email = db_settings.smtp_from_email
            self.from_name = db_settings.smtp_from_name or settings.SMTP_FROM_NAME
            logger.info("Using SMTP config from database")
        else:
            self.smtp_host = settings.SMTP_HOST
            self.smtp_port = int(settings.SMTP_PORT)
            self.smtp_user = settings.SMTP_USER
            self.smtp_password = settings.SMTP_PASSWORD
            self.from_email = settings.SMTP_FROM_EMAIL
            self.from_name = settings.SMTP_FROM_NAME
            logger.info("Using SMTP config from config.py")
        
        self.frontend_url = settings.FRONTEND_URL

    def _create_base_message(self, to_email: str, subject: str) -> MIMEMultipart:
        """Tạo khung email MIME cơ bản hỗ trợ đính kèm"""
        msg = MIMEMultipart('mixed')
        msg['Subject'] = f"[{self.from_name}] {subject}"
        msg['From'] = f"{self.from_name} <{self.from_email}>"
        msg['To'] = to_email
        return msg

    def _send_email_sync(self, msg: MIMEMultipart) -> bool:
        """Thực hiện gửi SMTP đồng bộ"""
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
                return True
        except Exception as e:
            logger.error(f"Lỗi SMTP: {str(e)}")
            return False

    async def _execute_send(self, msg: MIMEMultipart) -> bool:
        """Wrapper để chạy gửi mail không gây chặn (non-blocking) và kiểm tra quota"""
        # Config is already loaded in calling methods
        
        if not self.smtp_user or not self.smtp_password:
            logger.error("SMTP chưa cấu hình!")
            return False
            
        # Kiểm tra quota trước khi gửi
        if not await self._check_and_increment_quota():
            logger.error("Vượt quá hạn mức gửi mail hàng ngày!")
            return False

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._send_email_sync, msg)

    async def _check_and_increment_quota(self) -> bool:
        """Kiểm tra và cập nhật hạn mức gửi email hàng ngày"""
        if not self.db_session:
            return True # Không có DB thì bỏ qua kiểm tra quota (mặc định cho phép)

        try:
            from infrastructure.models.system_model import SystemSettingsModel
            from datetime import datetime
            
            # Lấy settings
            if hasattr(self.db_session, 'query'):
                # Sync session
                settings = self.db_session.query(SystemSettingsModel).first()
            else:
                # Async session
                from sqlalchemy.future import select
                stmt = select(SystemSettingsModel)
                result = await self.db_session.execute(stmt)
                settings = result.scalar_one_or_none()

            if not settings:
                return True

            # Kiểm tra xem có cần reset quota không (nếu qua ngày mới)
            now = datetime.utcnow()
            last_reset = settings.last_quota_reset or now
            
            if now.date() > last_reset.date():
                settings.mail_sent_today = 0
                settings.last_quota_reset = now
                await self.db_session.commit()

            # Kiểm tra quota
            if settings.mail_sent_today >= (settings.mail_quota_daily or 500):
                return False

            # Tăng số lượng đã gửi
            settings.mail_sent_today += 1
            await self.db_session.commit()
            return True
            
        except Exception as e:
            logger.warning(f"Lỗi kiểm tra quota: {e}")
            return True # Lỗi thì cho phép gửi để tránh chặn email quan trọng

    # --- CÁC PHƯƠNG THỨC PUBLIC ---

    async def send_email(self, to_email: str, subject: str, content: str, is_html: bool = False) -> bool:
        """Phương thức gửi email chung"""
        await self._ensure_config_loaded()
        msg = self._create_base_message(to_email, subject)
        msg.attach(MIMEText(content, 'html' if is_html else 'plain'))
        return await self._execute_send(msg)

    async def send_verification_email(self, to_email: str, token: str) -> bool:
        await self._ensure_config_loaded()
        msg = self._create_base_message(to_email, "Xác thực tài khoản")
        url = f"{self.frontend_url}/verify-email?token={token}"
        
        html = f"""
        <h3>Chào mừng bạn đến với UTH-ConfMS!</h3>
        <p>Vui lòng click nút dưới đây để xác thực tài khoản:</p>
        <a href="{url}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">Xác thực ngay</a>
        """
        msg.attach(MIMEText(html, 'html'))
        return await self._execute_send(msg)

    async def send_reset_password_email(self, to_email: str, token: str) -> bool:
        await self._ensure_config_loaded()
        msg = self._create_base_message(to_email, "Khôi phục mật khẩu")
        url = f"{self.frontend_url}/reset-password?token={token}"
        html = f"<h3>Yêu cầu đổi mật khẩu</h3><p>Click vào link: <a href='{url}'>{url}</a></p>"
        msg.attach(MIMEText(html, 'html'))
        return await self._execute_send(msg)
    
    
    async def send_notification(self, to_email: str, title: str, content: str, file_path: Optional[str] = None) -> bool:
        msg = self._create_base_message(to_email, title)
        msg.attach(MIMEText(content, 'html'))

        if file_path and os.path.exists(file_path):
            with open(file_path, "rb") as f:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(file_path)}")
            msg.attach(part)
        return await self._execute_send(msg)
    
    async def reset_password(self, token: str, new_password: str) -> bool:
        try:
            payload = self.jwt_service.decode_token(token)
            if payload.get("sub") != "password_reset":
                raise AuthenticationError("Token không hợp lệ.")

            user_id = payload.get("user_id")
            user = await self.user_repo.get_by_id(user_id)
        
            if not user:
                raise AuthenticationError("Người dùng không tồn tại.")
            user.password_hash = Hasher.hash_password(new_password)
            await self.db_session.commit()
            return True

        except Exception as e:
            print(f"Lỗi Reset Password: {str(e)}")
            raise AuthenticationError(f"Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ: {str(e)}")