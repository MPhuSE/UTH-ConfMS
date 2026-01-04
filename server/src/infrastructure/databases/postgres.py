from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy import create_engine, text
from typing import Generator
from config import settings

# Base cho Alembic migrations
Base = declarative_base()

# Tạo async engine
engine = create_async_engine(settings.DATABASE_URL, echo=True)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False 
)

sync_database_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
sync_engine = create_engine(sync_database_url, echo=True)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

def get_db() -> Generator[Session, None, None]:
    """Cung cấp sync database session cho mỗi request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Hàm test connection
async def test_connection():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("Kết nối csdl thành công!!! :))", result.scalar())
    except Exception as e:
        print("Kết nối csdl thất bại :((", e)
