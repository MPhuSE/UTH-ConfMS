from fastapi import APIRouter, Depends, HTTPException, status
from starlette.requests import Request
from api.schemas.auth_schema import TokenResponse
from services.auth.sso_service import SSOService
from dependency_container import get_sso_service
from config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth/sso", tags=["SSO"])

@router.get("/google/login")
async def google_login(sso_service: SSOService = Depends(get_sso_service)):
    """Returns the Google OAuth2 login URL."""
    try:
        auth_url = await sso_service.get_google_auth_url()
        return {"url": auth_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/google/callback", response_model=TokenResponse)
async def google_callback(
    code: str,
    sso_service: SSOService = Depends(get_sso_service)
):
    """Handles Google OAuth2 callback."""
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Code is missing"
        )
    
    try:
        access_token, refresh_token, user = await sso_service.authenticate_google_user(code)
        return TokenResponse(
            access_token=access_token, 
            refresh_token=refresh_token, 
            user=user
        )
    except Exception as e:
        logger.error(f"SSO callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=str(e)
        )
