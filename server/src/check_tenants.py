import asyncio
from infrastructure.databases.postgres import async_session
from infrastructure.models.tenant_model import TenantModel
from sqlalchemy.future import select

async def check():
    async with async_session() as session:
        stmt = select(TenantModel)
        result = await session.execute(stmt)
        tenants = result.scalars().all()
        print(f"Found {len(tenants)} tenants")
        for t in tenants:
            print(f" - {t.name} ({t.slug})")

if __name__ == "__main__":
    asyncio.run(check())
