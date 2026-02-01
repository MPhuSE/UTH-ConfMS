from fastapi import Header, HTTPException, Depends
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from infrastructure.databases.postgres import async_session
from sqlalchemy.future import select
from infrastructure.models.tenant_model import TenantModel, TenantMemberModel
from infrastructure.models.conference_model import ConferenceModel, TrackModel
from infrastructure.models.submission_model import SubmissionModel
from infrastructure.security.auth_dependencies import get_current_user

async def get_current_tenant(x_tenant_slug: Optional[str] = Header(None)) -> Optional[TenantModel]:
    """
    Dependency to resolve the current tenant based on X-Tenant-Slug header.
    """
    if not x_tenant_slug:
        return None
        
    async with async_session() as session:
        stmt = select(TenantModel).where(TenantModel.slug == x_tenant_slug)
        result = await session.execute(stmt)
        tenant = result.scalar_one_or_none()
        
        if not tenant:
            raise HTTPException(status_code=404, detail=f"Tenant '{x_tenant_slug}' not found")
            
        return tenant

async def require_tenant_membership(
    tenant: TenantModel = Depends(get_current_tenant),
    current_user = Depends(get_current_user)
):
    """
    Ensures the current user is a member of the resolved tenant.
    """
    if not tenant:
        return None
        
    async with async_session() as session:
        stmt = select(TenantMemberModel).where(
            TenantMemberModel.tenant_id == tenant.id,
            TenantMemberModel.user_id == current_user.id
        )
        result = await session.execute(stmt)
        membership = result.scalar_one_or_none()
        
        if not membership:
            raise HTTPException(status_code=403, detail="You do not have access to this tenant")
            
        return tenant

async def validate_conference_tenant(
    conference_id: Optional[int] = None,
    tenant: Optional[TenantModel] = Depends(get_current_tenant)
):
    """
    Ensures the requested conference belongs to the active tenant.
    """
    if conference_id is None:
        return None

    if not tenant:
        return conference_id

    async with async_session() as session:
        stmt = select(ConferenceModel).where(
            ConferenceModel.id == conference_id,
            ConferenceModel.tenant_id == tenant.id
        )
        result = await session.execute(stmt)
        conf = result.scalar_one_or_none()
        
        if not conf:
            raise HTTPException(status_code=403, detail="Conference does not belong to this tenant")
            
    return conference_id

async def validate_track_tenant(
    track_id: int,
    tenant: Optional[TenantModel] = Depends(get_current_tenant)
):
    """
    Ensures the requested track belongs to a conference that belongs to the active tenant.
    """
    if not tenant:
        return track_id

    async with async_session() as session:
        stmt = select(TrackModel).join(ConferenceModel).where(
            TrackModel.id == track_id,
            ConferenceModel.tenant_id == tenant.id
        )
        result = await session.execute(stmt)
        track = result.scalar_one_or_none()
        
        if not track:
            raise HTTPException(status_code=403, detail="Track does not belong to this tenant")
            
    return track_id

async def validate_submission_tenant(
    submission_id: int,
    tenant: Optional[TenantModel] = Depends(get_current_tenant)
):
    """
    Ensures the requested submission belongs to a conference that belongs to the active tenant.
    """
    if not tenant:
        return submission_id

    async with async_session() as session:
        stmt = select(SubmissionModel).join(ConferenceModel).where(
            SubmissionModel.id == submission_id,
            ConferenceModel.tenant_id == tenant.id
        )
        result = await session.execute(stmt)
        submission = result.scalar_one_or_none()
        
        if not submission:
            raise HTTPException(status_code=403, detail="Submission does not belong to this tenant")
            
    return submission_id
