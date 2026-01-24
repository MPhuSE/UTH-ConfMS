from fastapi import APIRouter, Depends, HTTPException, status, Query
from starlette.requests import Request
from typing import Optional
from datetime import datetime

from api.schemas.audit_log_schema import (
    AuditLogResponse,
    AuditLogListResponse,
    AuditLogCreateRequest,
)
from services.audit_log.audit_log_service import AuditLogService
from infrastructure.security.auth_dependencies import get_current_user, require_admin
from infrastructure.models.user_model import UserModel
from domain.exceptions import NotFoundError
from domain.models.audit_log import ActionType, ResourceType
from dependency_container import get_audit_log_service

router = APIRouter(prefix="/audit-logs", tags=["Audit Log"])


def get_client_ip(request: Request) -> Optional[str]:
    """Lấy IP address từ request."""
    if request.client:
        return request.client.host
    return None


def get_user_agent(request: Request) -> Optional[str]:
    """Lấy User-Agent từ request."""
    return request.headers.get("user-agent")


@router.post("", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def create_audit_log(
    request_body: AuditLogCreateRequest,
    request: Request,
    audit_log_service: AuditLogService = Depends(get_audit_log_service),
    current_user: UserModel = Depends(get_current_user),
):
    """Tạo audit log mới (Yêu cầu đăng nhập)."""
    try:
        audit_log = await audit_log_service.create_audit_log(
            action_type=request_body.action_type,
            resource_type=request_body.resource_type,
            user_id=current_user.id,
            resource_id=request_body.resource_id,
            description=request_body.description,
            old_values=request_body.old_values,
            new_values=request_body.new_values,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
            metadata=request_body.metadata,
        )

        # Tạo response với thông tin user
        return AuditLogResponse(
            id=audit_log.id,
            action_type=audit_log.action_type,
            resource_type=audit_log.resource_type,
            resource_id=audit_log.resource_id,
            user_id=audit_log.user_id,
            user_email=current_user.email,
            user_full_name=current_user.full_name,
            description=audit_log.description,
            old_values=audit_log.old_values,
            new_values=audit_log.new_values,
            ip_address=audit_log.ip_address,
            user_agent=audit_log.user_agent,
            metadata=audit_log.extra_metadata,
            created_at=audit_log.created_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tạo audit log: {str(e)}",
        )


@router.get("", response_model=AuditLogListResponse)
async def get_audit_logs(
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi trả về"),
    user_id: Optional[int] = Query(None, description="Lọc theo user ID"),
    action_type: Optional[ActionType] = Query(None, description="Lọc theo loại hành động"),
    resource_type: Optional[ResourceType] = Query(None, description="Lọc theo loại tài nguyên"),
    resource_id: Optional[int] = Query(None, description="Lọc theo resource ID"),
    start_date: Optional[datetime] = Query(None, description="Lọc từ ngày (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Lọc đến ngày (ISO format)"),
    audit_log_service: AuditLogService = Depends(get_audit_log_service),
    current_user: UserModel = Depends(require_admin),
):
    """Lấy danh sách audit logs (Yêu cầu quyền admin/chair)."""
    try:
        audit_logs = await audit_log_service.get_audit_logs(
            skip=skip,
            limit=limit,
            user_id=user_id,
            action_type=action_type,
            resource_type=resource_type,
            resource_id=resource_id,
            start_date=start_date,
            end_date=end_date,
        )

        total = await audit_log_service.count_audit_logs(
            user_id=user_id,
            action_type=action_type,
            resource_type=resource_type,
            resource_id=resource_id,
            start_date=start_date,
            end_date=end_date,
        )

        # Chuyển đổi sang response với thông tin user
        audit_log_responses = []
        for log in audit_logs:
            user_email = log.user.email if log.user else None
            user_full_name = log.user.full_name if log.user else None
            audit_log_responses.append(
                AuditLogResponse(
                    id=log.id,
                    action_type=log.action_type,
                    resource_type=log.resource_type,
                    resource_id=log.resource_id,
                    user_id=log.user_id,
                    user_email=user_email,
                    user_full_name=user_full_name,
                    description=log.description,
                    old_values=log.old_values,
                    new_values=log.new_values,
                    ip_address=log.ip_address,
                    user_agent=log.user_agent,
                    metadata=log.extra_metadata,
                    created_at=log.created_at,
                )
            )

        return AuditLogListResponse(
            audit_logs=audit_log_responses,
            total=total,
            skip=skip,
            limit=limit,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy danh sách audit logs: {str(e)}",
        )


@router.get("/{audit_log_id}", response_model=AuditLogResponse)
async def get_audit_log_by_id(
    audit_log_id: int,
    audit_log_service: AuditLogService = Depends(get_audit_log_service),
    current_user: UserModel = Depends(require_admin),
):
    """Lấy thông tin audit log theo ID (Yêu cầu quyền admin/chair)."""
    try:
        audit_log = await audit_log_service.get_audit_log_by_id(audit_log_id)
        
        user_email = audit_log.user.email if audit_log.user else None
        user_full_name = audit_log.user.full_name if audit_log.user else None
        
        return AuditLogResponse(
            id=audit_log.id,
            action_type=audit_log.action_type,
            resource_type=audit_log.resource_type,
            resource_id=audit_log.resource_id,
            user_id=audit_log.user_id,
            user_email=user_email,
            user_full_name=user_full_name,
            description=audit_log.description,
            old_values=audit_log.old_values,
            new_values=audit_log.new_values,
            ip_address=audit_log.ip_address,
            user_agent=audit_log.user_agent,
            metadata=audit_log.extra_metadata,
            created_at=audit_log.created_at,
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

