from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from dependency_container import get_db_session, get_audit_log_service
from infrastructure.security.rbac import require_admin
from infrastructure.models.tenant_model import TenantModel, TenantMemberModel
from infrastructure.models.user_model import UserModel
from infrastructure.security.auth_dependencies import get_current_user
from services.audit_log.audit_log_service import AuditLogService
from domain.models.audit_log import ActionType, ResourceType
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


@router.get("/my-memberships", response_model=TenantListResponse)
async def get_my_tenants(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_user),
):
    """Lấy danh sách các đơn vị mà user hiện tại là thành viên."""
    # Load roles và memberships để tránh lazy load error
    # current_user đã được load bằng async session trong get_current_user
    
    role_names = [r.name for r in current_user.roles]
    
    if "admin" in role_names:
        stmt = select(TenantModel).order_by(TenantModel.id.desc())
        result = await db.execute(stmt)
        tenants = result.scalars().all()
    else:
        # Load memberships với tenant details
        stmt = select(TenantMemberModel).where(
            TenantMemberModel.user_id == current_user.id
        ).options(selectinload(TenantMemberModel.tenant))
        result = await db.execute(stmt)
        memberships = result.scalars().all()
        tenants = [m.tenant for m in memberships]
        
    return TenantListResponse(tenants=tenants, total=len(tenants))


@router.get("", response_model=TenantListResponse)
async def list_tenants(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(require_admin),
):
    stmt = select(TenantModel).order_by(TenantModel.id.desc())
    result = await db.execute(stmt)
    tenants = result.scalars().all()
    return TenantListResponse(tenants=list(tenants), total=len(tenants))


@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    request: TenantCreateRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(require_admin),
    audit_service: AuditLogService = Depends(get_audit_log_service),
):
    stmt = select(TenantModel).where(TenantModel.slug == request.slug)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Tenant slug already exists")
        
    tenant = TenantModel(
        name=request.name,
        slug=request.slug,
        is_active=request.is_active,
    )
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)

    await audit_service.create_audit_log(
        action_type=ActionType.CREATE,
        resource_type=ResourceType.SYSTEM,
        user_id=current_user.id,
        resource_id=tenant.id,
        description=f"Created tenant {tenant.slug}",
        new_values={"id": tenant.id, "name": tenant.name, "slug": tenant.slug, "is_active": tenant.is_active},
        metadata={"section": "tenants"},
    )
    return tenant


@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    request: TenantUpdateRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(require_admin),
    audit_service: AuditLogService = Depends(get_audit_log_service),
):
    tenant = await db.get(TenantModel, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    old_values = {"id": tenant.id, "name": tenant.name, "slug": tenant.slug, "is_active": tenant.is_active}
    if request.name is not None:
        tenant.name = request.name
    if request.slug is not None:
        tenant.slug = request.slug
    if request.is_active is not None:
        tenant.is_active = request.is_active

    await db.commit()
    await db.refresh(tenant)

    await audit_service.create_audit_log(
        action_type=ActionType.UPDATE,
        resource_type=ResourceType.SYSTEM,
        user_id=current_user.id,
        resource_id=tenant.id,
        description=f"Updated tenant {tenant.slug}",
        old_values=old_values,
        new_values={"id": tenant.id, "name": tenant.name, "slug": tenant.slug, "is_active": tenant.is_active},
        metadata={"section": "tenants"},
    )
    return tenant


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(require_admin),
    audit_service: AuditLogService = Depends(get_audit_log_service),
):
    tenant = await db.get(TenantModel, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    slug = tenant.slug
    await db.delete(tenant)
    await db.commit()

    await audit_service.create_audit_log(
        action_type=ActionType.DELETE,
        resource_type=ResourceType.SYSTEM,
        user_id=current_user.id,
        resource_id=tenant_id,
        description=f"Deleted tenant {slug}",
        metadata={"section": "tenants"},
    )


@router.get("/{tenant_id}/members", response_model=TenantMemberListResponse)
async def list_tenant_members(
    tenant_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(require_admin),
):
    stmt = select(TenantMemberModel).where(
        TenantMemberModel.tenant_id == tenant_id
    ).options(selectinload(TenantMemberModel.user))
    result = await db.execute(stmt)
    members = result.scalars().all()
    
    responses = [
        TenantMemberResponse(
            tenant_id=m.tenant_id,
            user_id=m.user_id,
            role=m.role,
            user_full_name=m.user.full_name,
            user_email=m.user.email,
        )
        for m in members
    ]
    return TenantMemberListResponse(members=responses)


@router.post("/{tenant_id}/members", response_model=TenantMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_tenant_member(
    tenant_id: int,
    request: TenantMemberCreateRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(require_admin),
    audit_service: AuditLogService = Depends(get_audit_log_service),
):
    tenant = await db.get(TenantModel, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    user = await db.get(UserModel, request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    stmt = select(TenantMemberModel).where(
        TenantMemberModel.tenant_id == tenant_id,
        TenantMemberModel.user_id == request.user_id
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already in tenant")

    member = TenantMemberModel(
        tenant_id=tenant_id,
        user_id=request.user_id,
        role=request.role or "member",
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)

    await audit_service.create_audit_log(
        action_type=ActionType.ASSIGN,
        resource_type=ResourceType.USER,
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
async def remove_tenant_member(
    tenant_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(require_admin),
    audit_service: AuditLogService = Depends(get_audit_log_service),
):
    stmt = select(TenantMemberModel).where(
        TenantMemberModel.tenant_id == tenant_id,
        TenantMemberModel.user_id == user_id
    )
    result = await db.execute(stmt)
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Tenant member not found")
        
    await db.delete(member)
    await db.commit()

    await audit_service.create_audit_log(
        action_type=ActionType.DELETE,
        resource_type=ResourceType.USER,
        user_id=current_user.id,
        resource_id=user_id,
        description=f"Removed user {user_id} from tenant {tenant_id}",
        old_values={"tenant_id": tenant_id, "user_id": user_id},
        metadata={"section": "tenants"},
    )
