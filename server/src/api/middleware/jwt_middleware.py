from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
from infrastructure.security.jwt import JWTService
from infrastructure.databases.postgres import async_session
from infrastructure.repositories.user_repo_imlp import UserRepositoryImpl


class JWTAuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware để xác thực JWT token và gắn user vào request state.
    Middleware này sẽ:
    1. Kiểm tra JWT token trong Authorization header
    2. Decode và validate token
    3. Load user từ database
    4. Gắn user vào request.state để các controller có thể sử dụng
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.jwt_service = JWTService()
        # Các route công khai không cần authentication
        self.public_routes = [
            "/",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/auth/login",
            "/auth/register",
            "/auth/verify-email",
            "/auth/resend-verification",
            "/auth/forgot-password",
            "/auth/reset-password-confirm",
            "/auth/initial-chair-setup",
            "/auth/sso/google/login",
            "/auth/sso/google/callback",
            "/conferences",
            "/tracks"
        ]
    
    async def dispatch(self, request: Request, call_next):
        # Always allow CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)
        # Bỏ qua các route công khai (kiểm tra chính xác hoặc bắt đầu bằng route + /)
        path = request.url.path
        if any(path == route or path.startswith(route + "/") for route in self.public_routes):
            response = await call_next(request)
            return response
        
        # Kiểm tra Authorization header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            # Nếu không có token, vẫn cho phép request đi qua
            # Các controller sẽ tự kiểm tra authentication bằng Depends(get_current_user)
            return await call_next(request)
        
        token = auth_header.split(" ", 1)[1]
        
        try:
            # Decode và validate token
            payload = self.jwt_service.decode_token(token)
            user_id = payload.get("user_id")
            
            if user_id:
                # Load user từ database
                async with async_session() as session:
                    repo = UserRepositoryImpl(session)
                    user = await repo.get_by_id(user_id)
                    
                    if user and user.is_active:
                        # Gắn user vào request state để controller có thể sử dụng
                        request.state.user = user
                        request.state.user_id = user.id
                        request.state.user_roles = user.role_names
        
        except Exception:
            # Nếu có lỗi decode token (hết hạn, sai format...), vẫn cho qua
            # Controller cần auth sẽ tự fail thông qua Depends(get_current_user)
            pass
        
        # Tiếp tục xử lý request
        return await call_next(request)

