from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from infrastructure.repositories_interfaces.user_repository import UserRepository
from infrastructure.models.user_model import UserModel
from infrastructure.security.jwt import JWTService
from domain.exceptions import AuthenticationError
from dependency_container import get_user_repo, get_jwt_service

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_repo: UserRepository = Depends(get_user_repo),
    jwt_service: JWTService = Depends(get_jwt_service),
) -> UserModel:
    """Lấy thông tin user hiện tại từ JWT token."""
    token = credentials.credentials
    try:
        payload = jwt_service.decode_token(token)
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không hợp lệ.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = await user_repo.get_by_id(user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Người dùng không tồn tại.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản đã bị khóa.",
            )
        
        return user
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def require_admin(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    """Yêu cầu user phải có quyền admin."""
    role_names = current_user.role_names
    if "chair" not in role_names and "admin" not in role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền thực hiện thao tác này.",
        )
    return current_user

