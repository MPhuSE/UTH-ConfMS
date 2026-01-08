from fastapi import Depends, HTTPException, status
from typing import List, Optional, Union
from infrastructure.models.user_model import UserModel
from infrastructure.security.auth_dependencies import get_current_user


class RoleChecker:
    """RBAC (Role-Based Access Control) dependency factory."""
    
    def __init__(self, allowed_roles: List[str]):
        """
        Args:
            allowed_roles: Danh sách các role được phép truy cập
        """
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user: UserModel = Depends(get_current_user)) -> UserModel:
        """Kiểm tra xem user có quyền truy cập không."""
        role_names = current_user.role_names
        
        # Kiểm tra nếu user có ít nhất một role trong danh sách được phép
        if not any(role in self.allowed_roles for role in role_names):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bạn không có quyền thực hiện thao tác này. Yêu cầu một trong các role: {', '.join(self.allowed_roles)}"
            )
        
        return current_user


# Predefined role checkers cho các role phổ biến
require_admin = RoleChecker(["admin"])
require_chair = RoleChecker(["chair"])
require_reviewer = RoleChecker(["reviewer"])
require_author = RoleChecker(["author"])

# Combined checkers
require_admin_or_chair = RoleChecker(["admin", "chair"])
require_chair_or_reviewer = RoleChecker(["chair", "reviewer"])


def require_any_role(*roles: str):
    """
    Tạo một role checker với các role tùy chỉnh.
    
    Usage:
        @router.post("/endpoint")
        def my_endpoint(user = Depends(require_any_role("admin", "chair"))):
            ...
    """
    return RoleChecker(list(roles))


def require_all_roles(*roles: str):
    """
    Yêu cầu user phải có TẤT CẢ các role được chỉ định.
    
    Usage:
        @router.post("/endpoint")
        def my_endpoint(user = Depends(require_all_roles("admin", "chair"))):
            ...
    """
    def check_all_roles(current_user: UserModel = Depends(get_current_user)) -> UserModel:
        role_names = current_user.role_names
        
        missing_roles = [role for role in roles if role not in role_names]
        if missing_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bạn thiếu các quyền sau: {', '.join(missing_roles)}"
            )
        
        return current_user
    
    return check_all_roles


def require_owner_or_role(allowed_roles: List[str]):
    """
    Yêu cầu user phải là owner của resource HOẶC có một trong các role được phép.
    
    Usage:
        @router.put("/submissions/{submission_id}")
        def update_submission(
            submission_id: int,
            user = Depends(require_owner_or_role(["admin", "chair"]))
        ):
            # Trong function, kiểm tra ownership
            submission = get_submission(submission_id)
            if submission.author_id != user.id and "admin" not in user.role_names:
                raise HTTPException(403, "Not authorized")
    """
    def check_owner_or_role(current_user: UserModel = Depends(get_current_user)) -> UserModel:
        # Chỉ kiểm tra role ở đây, ownership sẽ được kiểm tra trong controller
        role_names = current_user.role_names
        
        if not any(role in allowed_roles for role in role_names):
            # Nếu không có role, vẫn cho phép nhưng phải kiểm tra ownership trong controller
            pass
        
        return current_user
    
    return check_owner_or_role


# Permission-based checkers (nếu cần mở rộng sau)
class PermissionChecker:
    """Permission-based access control (có thể mở rộng sau)."""
    
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions
    
    def __call__(self, current_user: UserModel = Depends(get_current_user)) -> UserModel:
        # TODO: Implement permission checking logic
        # Có thể map roles to permissions hoặc có bảng permissions riêng
        return current_user

