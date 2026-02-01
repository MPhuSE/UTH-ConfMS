from logging.config import fileConfig
import sys
import os
from pathlib import Path

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Thêm đường dẫn src để alembic tìm thấy các module infrastructure, config
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

# Import Base và tất cả models
from infrastructure.databases.postgres import Base
from infrastructure.models.user_model import UserModel
from infrastructure.models import (
    conference_model,
    submission_model,
    review_model,
    system_model,
    tenant_model,
    pc_model,
    discussion_model,
    rebuttal_model,
    audit_log_model,
)

from config import settings

# Đối tượng cấu hình Alembic
config = context.config

# Thiết lập log
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata để autogenerate bảng
target_metadata = Base.metadata

# --- XỬ LÝ DATABASE URL CHO RENDER ---
# Lấy URL từ settings (đã bao gồm biến môi trường DATABASE_URL)
raw_url = settings.DATABASE_URL

# Alembic cần driver đồng bộ (psycopg2) để chạy migration
if "postgresql+asyncpg://" in raw_url:
    database_url = raw_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
elif raw_url.startswith("postgres://"):
    database_url = raw_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif raw_url.startswith("postgresql://"):
    database_url = raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    database_url = raw_url

# Ghi đè URL vào cấu hình sqlalchemy
config.set_main_option("sqlalchemy.url", database_url)
# --------------------------------------

def run_migrations_offline() -> None:
    """Chạy migration ở chế độ offline."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Chạy migration ở chế độ online."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()