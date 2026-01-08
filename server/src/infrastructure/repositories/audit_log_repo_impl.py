from typing import Optional, List
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func as sql_func, and_, or_
from infrastructure.repositories_interfaces.audit_log_repository import AuditLogRepository
from infrastructure.models.audit_log_model import AuditLogModel
from domain.models.audit_log import ActionType, ResourceType


class AuditLogRepositoryImpl(AuditLogRepository):
    """Repository implementation cho Audit Log."""

    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def create(self, audit_log: AuditLogModel) -> AuditLogModel:
        """Tạo audit log mới."""
        self.db_session.add(audit_log)
        await self.db_session.flush()
        await self.db_session.refresh(audit_log)
        return audit_log

    async def get_by_id(self, audit_log_id: int) -> Optional[AuditLogModel]:
        """Lấy audit log theo ID."""
        stmt = select(AuditLogModel).where(AuditLogModel.id == audit_log_id)
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[int] = None,
        action_type: Optional[ActionType] = None,
        resource_type: Optional[ResourceType] = None,
        resource_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[AuditLogModel]:
        """Lấy danh sách audit logs với các bộ lọc."""
        stmt = select(AuditLogModel)

        # Áp dụng các bộ lọc
        conditions = []
        if user_id is not None:
            conditions.append(AuditLogModel.user_id == user_id)
        if action_type is not None:
            conditions.append(AuditLogModel.action_type == action_type.value)
        if resource_type is not None:
            conditions.append(AuditLogModel.resource_type == resource_type.value)
        if resource_id is not None:
            conditions.append(AuditLogModel.resource_id == resource_id)
        if start_date is not None:
            conditions.append(AuditLogModel.created_at >= start_date)
        if end_date is not None:
            conditions.append(AuditLogModel.created_at <= end_date)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        # Sắp xếp theo thời gian tạo (mới nhất trước)
        stmt = stmt.order_by(AuditLogModel.created_at.desc())
        stmt = stmt.offset(skip).limit(limit)

        result = await self.db_session.execute(stmt)
        return result.scalars().all()

    async def count(
        self,
        user_id: Optional[int] = None,
        action_type: Optional[ActionType] = None,
        resource_type: Optional[ResourceType] = None,
        resource_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> int:
        """Đếm số lượng audit logs với các bộ lọc."""
        stmt = select(sql_func.count(AuditLogModel.id))

        # Áp dụng các bộ lọc
        conditions = []
        if user_id is not None:
            conditions.append(AuditLogModel.user_id == user_id)
        if action_type is not None:
            conditions.append(AuditLogModel.action_type == action_type.value)
        if resource_type is not None:
            conditions.append(AuditLogModel.resource_type == resource_type.value)
        if resource_id is not None:
            conditions.append(AuditLogModel.resource_id == resource_id)
        if start_date is not None:
            conditions.append(AuditLogModel.created_at >= start_date)
        if end_date is not None:
            conditions.append(AuditLogModel.created_at <= end_date)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        result = await self.db_session.execute(stmt)
        return result.scalar() or 0

