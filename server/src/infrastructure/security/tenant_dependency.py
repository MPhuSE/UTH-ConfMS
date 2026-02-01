from fastapi import Header, HTTPException, Depends
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from infrastructure.databases.postgres import async_session
from sqlalchemy.future import select
from infrastructure.models.tenant_model import TenantModel

async def get_current_tenant(x_tenant_slug: Optional[str] = Header(None)):
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
            raise HTTPException(status_code=404, detail="Tenant not found")
            
        return tenant
