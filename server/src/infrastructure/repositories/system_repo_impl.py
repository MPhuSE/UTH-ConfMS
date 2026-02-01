from sqlalchemy.orm import Session
from sqlalchemy import select
from infrastructure.models.system_model import SystemSettingsModel

class SystemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_settings(self):
        """Get system settings, create default if not exists"""
        settings = self.db.query(SystemSettingsModel).first()
        if not settings:
            settings = SystemSettingsModel(
                quota_max_submissions_per_user=10,
                quota_max_reviews_per_reviewer=20,
                quota_max_file_size_mb=10,
                mail_quota_daily=500
            )
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

    async def get_settings_async(self, async_db):
        """Get system settings asynchronously"""
        from sqlalchemy.future import select
        stmt = select(SystemSettingsModel)
        result = await async_db.execute(stmt)
        settings = result.scalar_one_or_none()
        if not settings:
            # Note: Creating default in async might be complex if not handled carefully
            # Usually we expect it to exist after first run or migration
            return None
        return settings
