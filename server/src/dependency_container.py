from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

# Infrastructure Imports
from infrastructure.databases.postgres import async_session
from infrastructure.repositories.user_repo_imlp import UserRepositoryImpl
from infrastructure.repositories_interfaces.user_repository import UserRepository
from infrastructure.repositories.audit_log_repo_impl import AuditLogRepositoryImpl
from infrastructure.repositories_interfaces.audit_log_repository import AuditLogRepository
from infrastructure.repositories.conference_repo_impl import ConferenceRepositoryImpl 
from infrastructure.repositories_interfaces.conference_repository import ConferenceRepository
from infrastructure.repositories.conference_repo_impl import ConferenceRepositoryImpl
from infrastructure.security.jwt import JWTService


# Services Imports
from services.auth.login_service import LoginService
from services.auth.register_service import RegisterService
from services.auth.create_initial_chair import CreateInitialChairService
from services.auth.refresh_service import RefreshTokenService
from services.auth.auth_communication_service import AuthCommunicationService
from services.user.user_management_service import UserManagementService
from services.audit_log.audit_log_service import AuditLogService
from services.auth.email_verification_service import EmailVerificationService  
from services.email.email_service import EmailService
# Conference Services
from services.conference.create_conference import CreateConferenceService
from services.conference.get_conference import GetConferenceService

# 1. Hàm Factory cho Database Session (Async)
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Cung cấp AsyncSession cho mỗi request."""
    async with async_session() as session:
        yield session


# 2. User & Auth Factories
def get_user_repo(db_session: AsyncSession = Depends(get_db_session)) -> UserRepository:
    return UserRepositoryImpl(db_session)

def get_jwt_service() -> JWTService:
    return JWTService()

def get_email_service() -> EmailService:
    return EmailService()

def get_login_service(
    user_repo: UserRepository = Depends(get_user_repo),
    db_session: AsyncSession = Depends(get_db_session),
    jwt_service: JWTService = Depends(get_jwt_service),
) -> LoginService:
    return LoginService(user_repo, db_session, jwt_service)

def get_register_service(
    user_repo: UserRepository = Depends(get_user_repo),
    db_session: AsyncSession = Depends(get_db_session),
    jwt_service: JWTService = Depends(get_jwt_service),
    email_service: EmailService = Depends(get_email_service),
) -> RegisterService:
    return RegisterService(user_repo, db_session, jwt_service, email_service)

def get_refresh_service(
    db_session: AsyncSession = Depends(get_db_session), 
    user_repo: UserRepository = Depends(get_user_repo),
    jwt_service: JWTService = Depends(get_jwt_service)
) -> RefreshTokenService:
    return RefreshTokenService(db_session, user_repo, jwt_service)


# 3. Audit Log Factories
def get_audit_log_repo(db_session: AsyncSession = Depends(get_db_session)) -> AuditLogRepository:
    return AuditLogRepositoryImpl(db_session)

def get_audit_log_service(
    audit_log_repo: AuditLogRepository = Depends(get_audit_log_repo),
    db_session: AsyncSession = Depends(get_db_session),
) -> AuditLogService:
    return AuditLogService(audit_log_repo, db_session)


# =================================================================
# 4. CONFERENCE FACTORIES (PHẦN MỚI THÊM)
# =================================================================

def get_conference_repo(db_session: AsyncSession = Depends(get_db_session)) -> ConferenceRepository:
    """Cung cấp implementation của ConferenceRepository."""
    return ConferenceRepositoryImpl(db_session)

def get_create_conference_service(
    repo: ConferenceRepository = Depends(get_conference_repo)
) -> CreateConferenceService:
    return CreateConferenceService(repo)

def get_get_conference_service(
    repo: ConferenceRepository = Depends(get_conference_repo)
) -> GetConferenceService:
    return GetConferenceService(repo)


# =================================================================


# 5. Các hàm bổ trợ khác (Dọn dẹp lại từ code cũ của bạn)
def get_create_chair_service(
    user_repo: UserRepository = Depends(get_user_repo),
    db_session: AsyncSession = Depends(get_db_session),
) -> CreateInitialChairService:
    return CreateInitialChairService(user_repo, db_session)

def get_user_management_service(
    user_repo: UserRepository = Depends(get_user_repo),
    db_session: AsyncSession = Depends(get_db_session),
) -> UserManagementService:
    return UserManagementService(user_repo, db_session)

def get_auth_communication_service(
    user_repo = Depends(get_user_repo),
    db = Depends(get_db_session),
    jwt = Depends(get_jwt_service),
    email = Depends(get_email_service)
):
    return AuthCommunicationService(user_repo, db, jwt, email)
def get_email_verification_service(
    user_repo: UserRepository = Depends(get_user_repo),
    db_session: AsyncSession = Depends(get_db_session),
    jwt_service: JWTService = Depends(get_jwt_service),
    email_service: EmailService = Depends(get_email_service),
) -> AuthCommunicationService:
    return AuthCommunicationService(user_repo, db_session, jwt_service, email_service)
from fastapi import Depends
from sqlalchemy.orm import Session

from infrastructure.databases.postgres import get_db
from infrastructure.repositories.submission_repo_impl import SubmissionRepositoryImpl  # type: ignore


def get_submission_repo(db: Session = Depends(get_db)):
    return SubmissionRepositoryImpl(db)
def get_conference_repo(db: Session = Depends(get_db)):
    return ConferenceRepositoryImpl(db)