from fastapi import APIRouter, Depends, HTTPException, status ,BackgroundTasks

from api.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    ChairSetupRequest,
    RefreshTokenRequest,
    EmailVerificationRequest,
    MessageResponse,
    ResendVerificationRequest,
    ResetPasswordConfirmRequest
)
from api.schemas.user_schema import UserProfileUpdateRequest, UserPasswordUpdateRequest
from services.auth.login_service import LoginService
from services.auth.register_service import RegisterService
from services.auth.create_initial_chair import CreateInitialChairService
from services.auth.refresh_service import RefreshTokenService
from services.auth.auth_communication_service import AuthCommunicationService
from services.user.user_management_service import UserManagementService
from domain.exceptions import DuplicateUserError, AuthenticationError, InitialChairExistsError, NotFoundError
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.models.user_model import UserModel
from dependency_container import (
    get_login_service, 
    get_register_service, 
    get_create_chair_service,
    get_refresh_service, 
    get_email_verification_service,
    get_user_management_service,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register_user_endpoint(
    request: RegisterRequest,
    register_service: RegisterService = Depends(get_register_service),
):
    try:
        await register_service.register_new_user(
            full_name=request.full_name,
            email=request.email,
            password=request.password,    
        )
        return MessageResponse(
            message="Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
        )

    except DuplicateUserError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login_for_access_token_endpoint(
    request: LoginRequest, login_service: LoginService = Depends(get_login_service)
):
    try:
        access_token, refresh_token, user = await login_service.authenticate_and_get_tokens( 
            email=request.email, 
            password=request.password
        )
        return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserResponse.model_validate(user)) 
        
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(
    request: RefreshTokenRequest,
    refresh_service: RefreshTokenService = Depends(get_refresh_service)
):
    try:
        access_token, new_refresh_token = await refresh_service.refresh_access_token(
            refresh_token_plain=request.refresh_token
        )
        return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)
    
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

@router.post("/verify-email", response_model=MessageResponse)
async def verify_email_endpoint(
    request: EmailVerificationRequest,
    verification_service: AuthCommunicationService = Depends(get_email_verification_service),
):
    try:
        await verification_service.verify_email(request.token)
        return MessageResponse(message="Email đã được xác thực thành công!")
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification_endpoint(
    request: ResendVerificationRequest,
    verification_service: AuthCommunicationService = Depends(get_email_verification_service),
):
    try:
        await verification_service.resend_verification_email(request.email)
        return MessageResponse(message="Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.")
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: ResendVerificationRequest,
    service: AuthCommunicationService = Depends(get_email_verification_service)
):
    await service.request_password_reset(request.email)
    return MessageResponse(message="Email khôi phục mật khẩu đã được gửi.")

@router.post("/reset-password-confirm", response_model=MessageResponse)
async def reset_password_confirm_endpoint(
    request: ResetPasswordConfirmRequest,
    service: AuthCommunicationService = Depends(get_email_verification_service)
):
    try:
        await service.reset_password(
            token=request.token, 
            new_password=request.new_password
        )
        return MessageResponse(message="Mật khẩu của bạn đã được cập nhật thành công!")
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post("/send-document/{user_id}")
async def send_document(
    user_id: int,
    background_tasks: BackgroundTasks,
    service: AuthCommunicationService = Depends(get_email_verification_service)
):

    file_path = f"./storage/papers/paper_user_{user_id}.pdf"
    background_tasks.add_task(
        service.send_user_document, 
        user_id, 
        "Xác nhận nộp bài báo", 
        "Cảm ơn bạn đã nộp bài. Đính kèm là bản sao bài báo của bạn.",
        file_path
    )
    return {"message": "Tài liệu đang được gửi đến email của bạn."}


@router.put("/profile", response_model=UserResponse)
async def update_my_profile_endpoint(
    request: UserProfileUpdateRequest,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(get_current_user),
):
    """Cập nhật profile của user đã đăng nhập."""
    try:
        user = await user_service.update_profile(
            current_user.id,
            full_name=request.full_name,
            affiliation=request.affiliation,
            phone_number=request.phone_number,
            website_url=request.website_url,
            avatar_url=request.avatar_url,
        )
        return UserResponse.model_validate(user)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_my_password_endpoint(
    request: UserPasswordUpdateRequest,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(get_current_user),
):
    """Đổi mật khẩu cho user đã đăng nhập."""
    try:
        await user_service.update_user_password(current_user.id, request.new_password)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/initial-chair-setup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_initial_chair_endpoint(
    request: ChairSetupRequest, chair_service: CreateInitialChairService = Depends(get_create_chair_service)
):
    try:
        new_chair = await chair_service.create_chair(
            full_name=request.full_name,
            email=request.email,
            password=request.password,
        )
        return UserResponse.model_validate(new_chair)

    except InitialChairExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except DuplicateUserError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

