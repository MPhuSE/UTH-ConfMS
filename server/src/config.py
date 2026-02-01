from dotenv import load_dotenv
import os

load_dotenv()  

class Settings:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "123456")
    DB_NAME = os.getenv("DB_NAME", "ConfMS123")

    @property
    def DATABASE_URL(self):
        return (
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )
    # --- Cấu hình Bảo mật  ---
    # KHÓA BÍ MẬT DÙNG CHO JWT
    SECRET_KEY = os.getenv("SECRET_KEY") 
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 
    REFRESH_TOKEN_EXPIRE_DAYS = 60 * 24 * 10
    
    # --- Cấu hình Email ---
    # SMTP Server Configuration (Gmail, Outlook, hoặc SMTP server khác)
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")  # Email đăng nhập SMTP
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  # App Password (Gmail) hoặc mật khẩu SMTP
    SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "")  # Email người gửi
    SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "UTH-ConfMS")  # Tên hiển thị
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")  # URL frontend để tạo links

    # --- Cấu hình SSO (Google) ---
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "")

settings = Settings()
