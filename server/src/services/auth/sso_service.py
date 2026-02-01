import httpx
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from infrastructure.repositories_interfaces.user_repository import UserRepository
from infrastructure.security.jwt import JWTService
from infrastructure.models.user_model import UserModel
from domain.models.user import User
from config import settings
import logging

logger = logging.getLogger(__name__)

class SSOService:
    def __init__(
        self,
        user_repo: UserRepository,
        db_session: AsyncSession,
        jwt_service: JWTService
    ):
        self.user_repo = user_repo
        self.db_session = db_session
        self.jwt_service = jwt_service

    async def _get_sso_config(self):
        """Fetch SSO config from database"""
        try:
            from infrastructure.models.system_model import SystemSettingsModel
            from sqlalchemy.future import select
            stmt = select(SystemSettingsModel)
            result = await self.db_session.execute(stmt)
            settings_db = result.scalar_one_or_none()
            
            if settings_db and settings_db.google_client_id:
                return {
                    "client_id": settings_db.google_client_id,
                    "client_secret": settings_db.google_client_secret,
                    "redirect_uri": settings_db.google_redirect_uri or settings.GOOGLE_REDIRECT_URI
                }
        except Exception as e:
            logger.warning(f"Error loading SSO config from DB: {e}")
        
        return {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI
        }

    async def get_google_user_info(self, code: str) -> Dict[str, Any]:
        """Exchanges Google auth code for user info."""
        sso_config = await self._get_sso_config()
        
        async with httpx.AsyncClient() as client:
            # 1. Exchange code for access token
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                "code": code,
                "client_id": sso_config["client_id"],
                "client_secret": sso_config["client_secret"],
                "redirect_uri": sso_config["redirect_uri"],
                "grant_type": "authorization_code",
            }
            token_response = await client.post(token_url, data=data)
            if token_response.status_code != 200:
                logger.error(f"Failed to get Google token: {token_response.text}")
                raise Exception("Failed to get Google token")
            
            access_token = token_response.json().get("access_token")

            # 2. Get user info from Google API
            user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            user_info_response = await client.get(
                user_info_url, 
                headers={"Authorization": f"Bearer {access_token}"}
            )
            if user_info_response.status_code != 200:
                logger.error(f"Failed to get Google user info: {user_info_response.text}")
                raise Exception("Failed to get Google user info")
            
            return user_info_response.json()

    async def authenticate_google_user(self, code: str):
        """Authenticates or registers a user via Google SSO."""
        google_user = await self.get_google_user_info(code)
        email = google_user.get("email")
        sso_id = google_user.get("sub")
        full_name = google_user.get("name")
        avatar_url = google_user.get("picture")

        # Check if user exists by SSO ID
        user_model = await self.user_repo.get_by_sso("google", sso_id)
        
        if not user_model:
            # Check if user exists by email (link to SSO)
            user_model = await self.user_repo.get_by_email(email)
            if user_model:
                # Link existing user to SSO
                user_model.sso_provider = "google"
                user_model.sso_id = sso_id
                if not user_model.avatar_url:
                    user_model.avatar_url = avatar_url
                await self.db_session.commit()
            else:
                # Create new user
                from infrastructure.security.password_hash import Hasher
                import secrets
                
                random_password = secrets.token_urlsafe(32)
                user_model = UserModel(
                    email=email,
                    full_name=full_name,
                    hashed_password=Hasher.hash_password(random_password),
                    is_verified=True, # SSO users are usually verified
                    sso_provider="google",
                    sso_id=sso_id,
                    avatar_url=avatar_url
                )
                self.db_session.add(user_model)
                await self.db_session.commit()
                await self.db_session.refresh(user_model)

        # Generate tokens
        access_token = self.jwt_service.create_access_token(
            data={"sub": user_model.email, "user_id": user_model.id}
        )
        refresh_token = self.jwt_service.create_refresh_token(
            data={"sub": user_model.email, "user_id": user_model.id}
        )

        return access_token, refresh_token, user_model.to_domain_model()
