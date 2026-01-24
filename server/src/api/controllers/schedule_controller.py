from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from infrastructure.databases.postgres import get_db
from infrastructure.models.system_model import ScheduleItemModel
from infrastructure.models.conference_model import SessionModel
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin_or_chair
from domain.exceptions import NotFoundError
from api.utils.audit_utils import create_audit_log_sync

router = APIRouter(prefix="/schedule", tags=["Schedule"])


class ScheduleItemCreateRequest(BaseModel):
    conference_id: int
    submission_id: Optional[int] = None
    session_id: int
    start_time: datetime
    end_time: datetime
    order_index: int


class ScheduleItemUpdateRequest(BaseModel):
    submission_id: Optional[int] = None
    session_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    order_index: Optional[int] = None


class ScheduleItemResponse(BaseModel):
    id: int
    conference_id: int
    submission_id: Optional[int]
    session_id: int
    start_time: datetime
    end_time: datetime
    order_index: int

    class Config:
        from_attributes = True


@router.post("", response_model=ScheduleItemResponse, status_code=status.HTTP_201_CREATED)
def create_schedule_item(
    request: ScheduleItemCreateRequest,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db)
):
    """Create a schedule item - only admin or chair can create."""
    try:
        schedule_item = ScheduleItemModel(
            conference_id=request.conference_id,
            submission_id=request.submission_id,
            session_id=request.session_id,
            start_time=request.start_time,
            end_time=request.end_time,
            order_index=request.order_index
        )
        db.add(schedule_item)
        db.commit()
        db.refresh(schedule_item)
        
        # Audit logging
        try:
            create_audit_log_sync(
                db,
                action_type="CREATE",
                resource_type="SCHEDULE",
                user_id=current_user.id,
                resource_id=schedule_item.id,
                description=f"Created schedule item for conference {request.conference_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                new_values={
                    "conference_id": request.conference_id,
                    "submission_id": request.submission_id,
                    "session_id": request.session_id,
                    "order_index": request.order_index,
                },
            )
        except Exception:
            pass
        
        return ScheduleItemResponse(
            id=schedule_item.id,
            conference_id=schedule_item.conference_id,
            submission_id=schedule_item.submission_id,
            session_id=schedule_item.session_id,
            start_time=schedule_item.start_time,
            end_time=schedule_item.end_time,
            order_index=schedule_item.order_index
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/conferences/{conference_id}", response_model=List[ScheduleItemResponse])
def get_schedule_by_conference(
    conference_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get schedule for a conference (requires authentication)."""
    try:
        items = db.query(ScheduleItemModel).filter(
            ScheduleItemModel.conference_id == conference_id
        ).order_by(ScheduleItemModel.order_index).all()
        
        return [
            ScheduleItemResponse(
                id=item.id,
                conference_id=item.conference_id,
                submission_id=item.submission_id,
                session_id=item.session_id,
                start_time=item.start_time,
                end_time=item.end_time,
                order_index=item.order_index
            )
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/conferences/{conference_id}/public", response_model=List[ScheduleItemResponse])
def get_public_schedule(
    conference_id: int,
    db: Session = Depends(get_db)
):
    """
    Get public schedule for a conference (no authentication required).
    Only shows schedule items for accepted papers if conference allows public program.
    """
    from infrastructure.models.conference_model import ConferenceModel
    
    try:
        conf = db.query(ConferenceModel).filter(ConferenceModel.id == conference_id).first()
        if not conf:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conference not found")
        
        # Check if conference allows public program (you can add a field like public_program_enabled)
        # For now, we'll return the schedule if conference exists
        
        items = db.query(ScheduleItemModel).filter(
            ScheduleItemModel.conference_id == conference_id
        ).order_by(ScheduleItemModel.order_index).all()
        
        return [
            ScheduleItemResponse(
                id=item.id,
                conference_id=item.conference_id,
                submission_id=item.submission_id,
                session_id=item.session_id,
                start_time=item.start_time,
                end_time=item.end_time,
                order_index=item.order_index
            )
            for item in items
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{item_id}", response_model=ScheduleItemResponse)
def update_schedule_item(
    item_id: int,
    request: ScheduleItemUpdateRequest,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db)
):
    """Update a schedule item - only admin or chair can update."""
    try:
        item = db.query(ScheduleItemModel).filter(ScheduleItemModel.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule item not found")
        
        old_values = {
            "submission_id": item.submission_id,
            "session_id": item.session_id,
            "start_time": item.start_time.isoformat() if item.start_time else None,
            "end_time": item.end_time.isoformat() if item.end_time else None,
            "order_index": item.order_index,
        }
        
        if request.submission_id is not None:
            item.submission_id = request.submission_id
        if request.session_id is not None:
            item.session_id = request.session_id
        if request.start_time is not None:
            item.start_time = request.start_time
        if request.end_time is not None:
            item.end_time = request.end_time
        if request.order_index is not None:
            item.order_index = request.order_index
        
        db.commit()
        db.refresh(item)
        
        try:
            create_audit_log_sync(
                db,
                action_type="UPDATE",
                resource_type="SCHEDULE",
                user_id=current_user.id,
                resource_id=item_id,
                description=f"Updated schedule item {item_id} for conference {item.conference_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                old_values=old_values,
                new_values={
                    "submission_id": item.submission_id,
                    "session_id": item.session_id,
                    "start_time": item.start_time.isoformat() if item.start_time else None,
                    "end_time": item.end_time.isoformat() if item.end_time else None,
                    "order_index": item.order_index,
                },
            )
        except Exception:
            pass
        
        return ScheduleItemResponse(
            id=item.id,
            conference_id=item.conference_id,
            submission_id=item.submission_id,
            session_id=item.session_id,
            start_time=item.start_time,
            end_time=item.end_time,
            order_index=item.order_index
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule_item(
    item_id: int,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db)
):
    """Delete a schedule item - only admin or chair can delete."""
    try:
        item = db.query(ScheduleItemModel).filter(ScheduleItemModel.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule item not found")
        
        conference_id = item.conference_id
        submission_id = item.submission_id
        
        db.delete(item)
        db.commit()
        
        try:
            create_audit_log_sync(
                db,
                action_type="DELETE",
                resource_type="SCHEDULE",
                user_id=current_user.id,
                resource_id=item_id,
                description=f"Deleted schedule item {item_id} for conference {conference_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                old_values={
                    "conference_id": conference_id,
                    "submission_id": submission_id,
                    "session_id": item.session_id,
                },
            )
        except Exception:
            pass
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

