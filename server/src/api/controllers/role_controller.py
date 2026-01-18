from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from infrastructure.databases.postgres import get_db
from infrastructure.security.auth_dependencies import require_admin
from infrastructure.models.user_model import RoleModel, UserModel, UserRoleModel
from api.schemas.role_schema import RoleListResponse, RoleResponse


router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("", response_model=RoleListResponse)
def list_roles(
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all roles (Admin only)."""
    try:
        roles = db.query(RoleModel).order_by(RoleModel.id.asc()).all()
        return RoleListResponse(roles=[RoleResponse.model_validate(r) for r in roles])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{role_name}/users")
def list_users_by_role(
    role_name: str,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List users having a given role (Admin/Chair only)."""
    role = db.query(RoleModel).filter(RoleModel.name == role_name).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    users = (
        db.query(UserModel)
        .join(UserRoleModel, UserRoleModel.user_id == UserModel.id)
        .filter(UserRoleModel.role_id == role.id)
        .order_by(UserModel.id.asc())
        .all()
    )
    return {
        "role": {"id": role.id, "name": role.name},
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": getattr(u, "full_name", None),
                "affiliation": getattr(u, "affiliation", None),
                "role_names": getattr(u, "role_names", []),
            }
            for u in users
        ],
    }

