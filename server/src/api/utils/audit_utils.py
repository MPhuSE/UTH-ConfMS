from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from infrastructure.models.audit_log_model import AuditLogModel


def create_audit_log_sync(
    db: Session,
    *,
    action_type: str,
    resource_type: str,
    user_id: int,
    resource_id: Optional[int] = None,
    description: Optional[str] = None,
    old_values: Optional[Dict[str, Any]] = None,
    new_values: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """Create audit log using sync SQLAlchemy Session."""
    log = AuditLogModel(
        action_type=action_type,
        resource_type=resource_type,
        resource_id=resource_id,
        user_id=user_id,
        description=description,
        old_values=old_values,
        new_values=new_values,
        ip_address=ip_address,
        user_agent=user_agent,
        extra_metadata=metadata or {},
    )
    db.add(log)
    db.commit()
