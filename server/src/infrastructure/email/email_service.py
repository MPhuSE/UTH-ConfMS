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
        self._load_smtp_config()
    
    def _load_smtp_config(self):
        """Load SMTP config from database (if available) or fallback to config.py"""
        # Try to load from database first
        if self.db_session:
            try:
                from infrastructure.models.system_model import SystemSettingsModel
                # Handle both sync and async sessions
                if hasattr(self.db_session, 'query'):
                    # Sync session
                    system_settings = self.db_session.query(SystemSettingsModel).first()
                else:
                    # Async session - we'll skip database config for async sessions
                    # as it requires sync query. Fallback to config.py
                    system_settings = None
                
                if system_settings and system_settings.smtp_host:
                    # Use database config
                    self.smtp_host = system_settings.smtp_host
                    self.smtp_port = system_settings.smtp_port or int(settings.SMTP_PORT)
                    self.smtp_user = system_settings.smtp_user
                    self.smtp_password = system_settings.smtp_password
                    self.from_email = system_settings.smtp_from_email
                    self.from_name = system_settings.smtp_from_name or settings.SMTP_FROM_NAME
                    logger.info("Using SMTP config from database")
                    return
            except Exception as e:
                logger.warning(f"Could not load SMTP config from database: {e}")
        
        # Fallback to config.py
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
        self.frontend_url = settings.FRONTEND_URL
        logger.info("Using SMTP config from config.py")

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
        """Wrapper để chạy gửi mail không gây chặn (non-blocking)"""
        if not self.smtp_user or not self.smtp_password:
            logger.error("SMTP chưa cấu hình!")
            return False
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._send_email_sync, msg)

    # --- CÁC PHƯƠNG THỨC PUBLIC ---

    async def send_verification_email(self, to_email: str, token: str) -> bool:
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