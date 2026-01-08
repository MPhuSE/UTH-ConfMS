from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
from typing import List, Optional
from infrastructure.security.jwt import JWTService
from infrastructure.databases.postgres import async_session
from infrastructure.repositories.user_repo_imlp import UserRepositoryImpl


class RBACMiddleware(BaseHTTPMiddleware):
    """
    Middleware để kiểm tra quyền truy cập dựa trên route và role.
    Có thể cấu hình các route cần role cụ thể.
    """
    
    def __init__(self, app, protected_routes: Optional[dict] = None):
        """
        Args:
            app: FastAPI application
            protected_routes: Dict mapping route patterns to required roles
                Example: {
                    "/admin/*": ["admin"],
                    "/conferences/*": ["admin", "chair"],
                    "/reviews/*": ["reviewer", "chair"]
                }
        """
        super().__init__(app)
        self.protected_routes = protected_routes or {}
        self.jwt_service = JWTService()
    
    async def dispatch(self, request: Request, call_next):
        # Bỏ qua các route công khai
        public_routes = ["/", "/docs", "/openapi.json", "/redoc", "/auth/login", "/auth/register"]
        if any(request.url.path.startswith(route) for route in public_routes):
            response = await call_next(request)
            return response
        
        # Kiểm tra route có trong protected_routes không
        required_roles = None
        for route_pattern, roles in self.protected_routes.items():
            if self._match_route(request.url.path, route_pattern):
                required_roles = roles
                break
        
        # Nếu route không yêu cầu role cụ thể, cho phép truy cập (sẽ được kiểm tra ở controller)
        if required_roles is None:
            response = await call_next(request)
            return response
        
        # Kiểm tra authentication
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication required"}
            )
        
        token = auth_header.split(" ", 1)[1]
        
        try:
            # Decode token
            payload = self.jwt_service.decode_token(token)
            user_id = payload.get("user_id")
            
            if not user_id:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid token"}
                )
            
            # Lấy user và kiểm tra role
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
                
                # Kiểm tra role
                user_roles = user.role_names
                if not any(role in user_roles for role in required_roles):
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={
                            "detail": f"Access denied. Required roles: {', '.join(required_roles)}"
                        }
                    )
            
            # Cho phép tiếp tục
            response = await call_next(request)
            return response
            
        except Exception as e:
            # Nếu có lỗi, vẫn cho phép request đi qua (sẽ được xử lý ở controller)
            # Hoặc có thể return 401/403 tùy theo yêu cầu
            response = await call_next(request)
            return response
    
    def _match_route(self, path: str, pattern: str) -> bool:
        """
        Kiểm tra xem path có match với pattern không.
        Hỗ trợ wildcard: /admin/* sẽ match /admin/users, /admin/settings, etc.
        """
        if pattern.endswith("/*"):
            prefix = pattern[:-2]
            return path.startswith(prefix)
        return path == pattern

