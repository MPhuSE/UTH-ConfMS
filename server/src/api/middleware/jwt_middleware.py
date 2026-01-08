from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
from infrastructure.security.jwt import JWTService
from infrastructure.databases.postgres import async_session
from infrastructure.repositorties.user_repo_imlp import UserRepositoryImpl


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
            "/auth/initial-chair-setup"
        ]
    
    async def dispatch(self, request: Request, call_next):
        # Bỏ qua các route công khai
        if any(request.url.path == route or request.url.path.startswith(route + "/") for route in self.public_routes):
            response = await call_next(request)
            return response
        
        # Kiểm tra Authorization header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            # Nếu không có token, vẫn cho phép request đi qua
            # Các controller sẽ tự kiểm tra authentication bằng Depends(get_current_user)
            response = await call_next(request)
            return response
        
        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid authorization header format. Expected 'Bearer <token>'"}
            )
        
        token = auth_header.split(" ", 1)[1]
        
        try:
            # Decode và validate token
            payload = self.jwt_service.decode_token(token)
            user_id = payload.get("user_id")
            
            if not user_id:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid token: missing user_id"}
                )
            
            # Load user từ database
            async with async_session() as session:
                repo = UserRepositoryImpl(session)
                user = await repo.get_by_id(user_id)
                
                if not user:
                    return JSONResponse(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        content={"detail": "User not found"}
                    )
                
                if not user.is_active:
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"detail": "Account is disabled"}
                    )
                
                # Gắn user vào request state để controller có thể sử dụng
                request.state.user = user
                request.state.user_id = user.id
                request.state.user_roles = user.role_names
        
        except Exception as e:
            # Nếu có lỗi decode token, trả về 401
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Authentication failed: {str(e)}"}
            )
        
        # Tiếp tục xử lý request
        response = await call_next(request)
        return response

