from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from infrastructure.databases.postgres import get_db
from infrastructure.security.rbac import require_admin
from infrastructure.models.tenant_model import TenantModel, TenantMemberModel
from infrastructure.models.user_model import UserModel
from api.utils.audit_utils import create_audit_log_sync
from api.schemas.tenant_schema import (
    TenantCreateRequest,
    TenantUpdateRequest,
    TenantResponse,
    TenantListResponse,
    TenantMemberCreateRequest,
    TenantMemberResponse,
    TenantMemberListResponse,
)

router = APIRouter(prefix="/tenants", tags=["Tenancy"])


@router.get("", response_model=TenantListResponse)
def list_tenants(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    tenants = db.query(TenantModel).order_by(TenantModel.id.desc()).all()
    return TenantListResponse(tenants=tenants, total=len(tenants))


@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
def create_tenant(
    request: TenantCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    existing = db.query(TenantModel).filter(TenantModel.slug == request.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tenant slug already exists")
    tenant = TenantModel(
        name=request.name,
        slug=request.slug,
        is_active=request.is_active,
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    create_audit_log_sync(
        db,
        action_type="CREATE",
        resource_type="SYSTEM",
        user_id=current_user.id,
        resource_id=tenant.id,
        description=f"Created tenant {tenant.slug}",
        new_values={"id": tenant.id, "name": tenant.name, "slug": tenant.slug, "is_active": tenant.is_active},
        metadata={"section": "tenants"},
    )
    return tenant


@router.put("/{tenant_id}", response_model=TenantResponse)
def update_tenant(
    tenant_id: int,
    request: TenantUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    old_values = {"id": tenant.id, "name": tenant.name, "slug": tenant.slug, "is_active": tenant.is_active}
    if request.name is not None:
        tenant.name = request.name
    if request.slug is not None:
        tenant.slug = request.slug
    if request.is_active is not None:
        tenant.is_active = request.is_active

    db.commit()
    db.refresh(tenant)

    create_audit_log_sync(
        db,
        action_type="UPDATE",
        resource_type="SYSTEM",
        user_id=current_user.id,
        resource_id=tenant.id,
        description=f"Updated tenant {tenant.slug}",
        old_values=old_values,
        new_values={"id": tenant.id, "name": tenant.name, "slug": tenant.slug, "is_active": tenant.is_active},
        metadata={"section": "tenants"},
    )
    return tenant


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    old_values = {"id": tenant.id, "name": tenant.name, "slug": tenant.slug, "is_active": tenant.is_active}
    db.delete(tenant)
    db.commit()

    create_audit_log_sync(
        db,
        action_type="DELETE",
        resource_type="SYSTEM",
        user_id=current_user.id,
        resource_id=tenant_id,
        description=f"Deleted tenant {old_values.get('slug')}",
        old_values=old_values,
        metadata={"section": "tenants"},
    )


@router.get("/{tenant_id}/members", response_model=TenantMemberListResponse)
def list_tenant_members(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    members = db.query(TenantMemberModel).filter(TenantMemberModel.tenant_id == tenant_id).all()
    responses = []
    for member in members:
        user = db.query(UserModel).filter(UserModel.id == member.user_id).first()
        responses.append(TenantMemberResponse(
            tenant_id=member.tenant_id,
            user_id=member.user_id,
            role=member.role,
            user_full_name=user.full_name if user else None,
            user_email=user.email if user else None,
        ))
    return TenantMemberListResponse(members=responses)


@router.post("/{tenant_id}/members", response_model=TenantMemberResponse, status_code=status.HTTP_201_CREATED)
def add_tenant_member(
    tenant_id: int,
    request: TenantMemberCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    user = db.query(UserModel).filter(UserModel.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(TenantMemberModel)
        .filter(
            TenantMemberModel.tenant_id == tenant_id,
            TenantMemberModel.user_id == request.user_id
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="User already in tenant")

    member = TenantMemberModel(
        tenant_id=tenant_id,
        user_id=request.user_id,
        role=request.role or "member",
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    create_audit_log_sync(
        db,
        action_type="ASSIGN",
        resource_type="USER",
        user_id=current_user.id,
        resource_id=user.id,
        description=f"Added user {user.email} to tenant {tenant.slug}",
        new_values={"tenant_id": tenant_id, "user_id": user.id, "role": member.role},
        metadata={"section": "tenants"},
    )
    return TenantMemberResponse(
        tenant_id=member.tenant_id,
        user_id=member.user_id,
        role=member.role,
        user_full_name=user.full_name,
        user_email=user.email,
    )


@router.delete("/{tenant_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tenant_member(
    tenant_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    member = (
        db.query(TenantMemberModel)
        .filter(
            TenantMemberModel.tenant_id == tenant_id,
            TenantMemberModel.user_id == user_id
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Tenant member not found")
    db.delete(member)
    db.commit()

    create_audit_log_sync(
        db,
        action_type="DELETE",
        resource_type="USER",
        user_id=current_user.id,
        resource_id=user_id,
        description=f"Removed user {user_id} from tenant {tenant_id}",
        old_values={"tenant_id": tenant_id, "user_id": user_id},
        metadata={"section": "tenants"},
    )
