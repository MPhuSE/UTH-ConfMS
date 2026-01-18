from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from datetime import datetime
from infrastructure.security.jwt import JWTService
from infrastructure.databases.postgres import async_session
from infrastructure.repositories.user_repo_imlp import UserRepositoryImpl

class LastLoginMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
            try:
                jwt_svc = JWTService()
                payload = jwt_svc.decode_token(token)
                user_id = payload.get("user_id")
                if user_id:
                    async with async_session() as session:
                        repo = UserRepositoryImpl(session)
                        user = await repo.get_by_id(user_id)
                        if user:
                            user.last_login = datetime.utcnow()
                            await repo.update(user)
                            await session.commit()
            except Exception:
                # ignore errors silently so middleware won't break requests
                pass

        response = await call_next(request)
        return response
