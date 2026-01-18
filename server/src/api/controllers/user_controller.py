from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List

from api.schemas.user_schema import (
    UserCreateRequest,
    UserUpdateRequest,
    UserPasswordUpdateRequest,
    UserRoleUpdateRequest,
    UserResponse,
    UserListResponse,
    UserProfileUpdateRequest,
    UserLookupListResponse,
)
from services.user.user_management_service import UserManagementService
from infrastructure.models.user_model import UserModel
from infrastructure.security.auth_dependencies import get_current_user, require_admin
from domain.exceptions import DuplicateUserError, NotFoundError
from dependency_container import get_user_management_service

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("", response_model=UserListResponse)
async def get_all_users(
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi trả về"),
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(require_admin),
):
    """Lấy danh sách tất cả người dùng (Yêu cầu quyền admin/chair)."""
    try:
        users = await user_service.get_all_users(skip=skip, limit=limit)
        return UserListResponse(
            users=[UserResponse.model_validate(user) for user in users],
            total=len(users),
            skip=skip,
            limit=limit,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy danh sách người dùng: {str(e)}",
        )


@router.get("/search", response_model=UserLookupListResponse)
async def search_users(
    q: str = Query(..., min_length=2, description="Từ khóa tìm kiếm (email hoặc tên)"),
    limit: int = Query(10, ge=1, le=20),
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(get_current_user),
):
    """Tìm user theo email hoặc tên - dùng cho chọn đồng tác giả."""
    try:
        users = await user_service.search_users(query=q, limit=limit)
        return UserLookupListResponse(users=users)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tìm người dùng: {str(e)}",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserModel = Depends(get_current_user),
):
    """Lấy thông tin người dùng hiện tại."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    request: UserProfileUpdateRequest,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(get_current_user),
):
    """Cập nhật profile của chính user."""
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


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(require_admin),
):
    """Lấy thông tin người dùng theo ID (Yêu cầu quyền admin/chair)."""
    try:
        user = await user_service.get_user_by_id(user_id)
        return UserResponse.model_validate(user)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    request: UserCreateRequest,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(require_admin),
):
    """Tạo người dùng mới (Yêu cầu quyền admin/chair)."""
    try:
        user = await user_service.create_user(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
            affiliation=request.affiliation,
            phone_number=request.phone_number,
            website_url=request.website_url,
            is_active=request.is_active,
            is_verified=request.is_verified,
            role_ids=request.role_ids,
        )
        return UserResponse.model_validate(user)
    except DuplicateUserError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    request: UserUpdateRequest,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(require_admin),
):
    """Cập nhật thông tin người dùng (Yêu cầu quyền admin/chair)."""
    try:
        user = await user_service.update_user(
            user_id=user_id,
            full_name=request.full_name,
            affiliation=request.affiliation,
            phone_number=request.phone_number,
            website_url=request.website_url,
            is_active=request.is_active,
            is_verified=request.is_verified,
        )
        return UserResponse.model_validate(user)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.put("/{user_id}/password", status_code=status.HTTP_204_NO_CONTENT)
async def update_user_password(
    user_id: int,
    request: UserPasswordUpdateRequest,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(get_current_user),
):
    """Cập nhật mật khẩu người dùng. Người dùng chỉ có thể đổi mật khẩu của chính mình, trừ khi là admin."""
    # Kiểm tra quyền: chỉ có thể đổi mật khẩu của chính mình hoặc là admin
    role_names = [role.name for role in current_user.roles]
    is_admin = "chair" in role_names or "admin" in role_names
    
    if not is_admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn chỉ có thể đổi mật khẩu của chính mình.",
        )

    try:
        await user_service.update_user_password(user_id, request.new_password)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.put("/{user_id}/roles", response_model=UserResponse)
async def add_role_to_user(
    user_id: int,
    request: UserRoleUpdateRequest,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(require_admin),
):
    """Thêm role cho người dùng (Yêu cầu quyền admin/chair)."""
    try:
        user = await user_service.add_role_to_user(user_id, request.role_id)
        return UserResponse.model_validate(user)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("/{user_id}/roles/{role_id}", response_model=UserResponse)
async def remove_role_from_user(
    user_id: int,
    role_id: int,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(require_admin),
):
    """Xóa role khỏi người dùng (Yêu cầu quyền admin/chair)."""
    try:
        user = await user_service.remove_role_from_user(user_id, role_id)
        return UserResponse.model_validate(user)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    user_service: UserManagementService = Depends(get_user_management_service),
    current_user: UserModel = Depends(require_admin),
):
    """Xóa người dùng (Yêu cầu quyền admin/chair)."""
    try:
        await user_service.delete_user(user_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

