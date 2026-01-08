# Hướng dẫn sử dụng RBAC (Role-Based Access Control)

## 1. Import RBAC Checkers

```python
from infrastructure.security.rbac import (
    require_admin,
    require_chair,
    require_reviewer,
    require_author,
    require_admin_or_chair,
    require_chair_or_reviewer,
    require_any_role,
    require_all_roles,
    RoleChecker
)
```

## 2. Sử dụng trong Controllers

### 2.1. Yêu cầu một role cụ thể

```python
from fastapi import APIRouter, Depends
from infrastructure.security.rbac import require_admin

router = APIRouter()

@router.get("/admin/users")
def get_all_users(current_user=Depends(require_admin)):
    # Chỉ admin mới có thể truy cập
    return {"users": []}
```

### 2.2. Yêu cầu một trong nhiều roles

```python
from infrastructure.security.rbac import require_admin_or_chair

@router.post("/conferences")
def create_conference(
    request: ConferenceRequest,
    current_user=Depends(require_admin_or_chair)
):
    # Admin hoặc Chair có thể tạo conference
    return {"message": "Conference created"}
```

### 2.3. Yêu cầu tùy chỉnh với require_any_role

```python
from infrastructure.security.rbac import require_any_role

@router.get("/reviews")
def get_reviews(current_user=Depends(require_any_role("reviewer", "chair"))):
    # Reviewer hoặc Chair có thể xem reviews
    return {"reviews": []}
```

### 2.4. Yêu cầu TẤT CẢ các roles

```python
from infrastructure.security.rbac import require_all_roles

@router.delete("/system/reset")
def reset_system(current_user=Depends(require_all_roles("admin", "super_admin"))):
    # Phải có CẢ admin VÀ super_admin
    return {"message": "System reset"}
```

### 2.5. Tạo RoleChecker tùy chỉnh

```python
from infrastructure.security.rbac import RoleChecker

# Tạo checker cho role tùy chỉnh
require_track_chair = RoleChecker(["track_chair", "chair"])

@router.put("/tracks/{track_id}")
def update_track(
    track_id: int,
    current_user=Depends(require_track_chair)
):
    return {"message": "Track updated"}
```

## 3. Sử dụng RBAC Middleware (Optional)

Nếu muốn bảo vệ route ở tầng middleware:

```python
from api.middleware.rbac_middleware import RBACMiddleware

# Trong main.py
protected_routes = {
    "/admin/*": ["admin"],
    "/conferences/*": ["admin", "chair"],
    "/reviews/*": ["reviewer", "chair", "admin"]
}

app.add_middleware(RBACMiddleware, protected_routes=protected_routes)
```

## 4. Các Role Checkers có sẵn

- `require_admin` - Chỉ admin
- `require_chair` - Chỉ chair
- `require_reviewer` - Chỉ reviewer
- `require_author` - Chỉ author
- `require_admin_or_chair` - Admin hoặc Chair
- `require_chair_or_reviewer` - Chair hoặc Reviewer

## 5. Ví dụ thực tế

### Controller với nhiều mức phân quyền

```python
from fastapi import APIRouter, Depends
from infrastructure.security.rbac import (
    require_admin,
    require_admin_or_chair,
    require_any_role
)
from infrastructure.security.auth_dependencies import get_current_user

router = APIRouter(prefix="/conferences", tags=["Conferences"])

# Public endpoint - không cần authentication
@router.get("/public")
def get_public_conferences():
    return {"conferences": []}

# Cần authentication nhưng không cần role cụ thể
@router.get("/my-conferences")
def get_my_conferences(current_user=Depends(get_current_user)):
    return {"conferences": []}

# Chỉ admin hoặc chair
@router.post("")
def create_conference(
    request: ConferenceRequest,
    current_user=Depends(require_admin_or_chair)
):
    return {"message": "Created"}

# Chỉ admin
@router.delete("/{conference_id}")
def delete_conference(
    conference_id: int,
    current_user=Depends(require_admin)
):
    return {"message": "Deleted"}
```

## 6. Lưu ý

1. **Thứ tự dependency**: `get_current_user` luôn được gọi trước các role checkers
2. **Error handling**: Tất cả các checkers đều tự động raise `HTTPException` nếu không có quyền
3. **Performance**: Role checkers sử dụng dependency injection của FastAPI, rất hiệu quả
4. **Flexibility**: Có thể kết hợp nhiều checkers hoặc tạo custom logic

## 7. Best Practices

1. Sử dụng role checkers thay vì check thủ công trong controller
2. Đặt role checkers ở dependency, không check trong function body
3. Sử dụng `require_any_role` cho các trường hợp phức tạp
4. Document rõ ràng quyền truy cập của mỗi endpoint

