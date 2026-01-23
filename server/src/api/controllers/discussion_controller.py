from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from infrastructure.databases.postgres import get_db
from infrastructure.security.rbac import require_any_role
from api.schemas.discussion_schema import DiscussionMessageCreateRequest, DiscussionMessageResponse
from infrastructure.models.discussion_model import SubmissionDiscussionMessageModel
from infrastructure.models.user_model import UserModel
from api.utils.audit_utils import create_audit_log_sync


router = APIRouter(prefix="/submissions", tags=["Discussions"])


@router.get("/{submission_id}/discussions", response_model=List[DiscussionMessageResponse])
def list_discussion_messages(
    submission_id: int,
    req: Request,
    current_user=Depends(require_any_role("chair", "reviewer", "admin")),
    db: Session = Depends(get_db),
):
    try:
        msgs = (
            db.query(SubmissionDiscussionMessageModel, UserModel)
            .join(UserModel, UserModel.id == SubmissionDiscussionMessageModel.user_id)
            .filter(SubmissionDiscussionMessageModel.submission_id == submission_id)
            .order_by(SubmissionDiscussionMessageModel.created_at.asc())
            .all()
        )

        try:
            create_audit_log_sync(
                db,
                action_type="VIEW",
                resource_type="DISCUSSION",
                user_id=current_user.id,
                resource_id=submission_id,
                description="Viewed internal discussion for a submission",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"event": "discussion_view", "submission_id": submission_id},
            )
        except Exception:
            pass

        out: List[DiscussionMessageResponse] = []
        for msg, user in msgs:
            out.append(
                DiscussionMessageResponse(
                    id=msg.id,
                    submission_id=msg.submission_id,
                    user_id=msg.user_id,
                    user_name=getattr(user, "full_name", None) or getattr(user, "email", None),
                    content=msg.content,
                    created_at=msg.created_at,
                )
            )
        return out
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{submission_id}/discussions", response_model=DiscussionMessageResponse, status_code=status.HTTP_201_CREATED)
def create_discussion_message(
    submission_id: int,
    payload: DiscussionMessageCreateRequest,
    req: Request,
    current_user=Depends(require_any_role("chair", "reviewer", "admin")),
    db: Session = Depends(get_db),
):
    content = (payload.content or "").strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Content is required")

    try:
        msg = SubmissionDiscussionMessageModel(
            submission_id=submission_id,
            user_id=current_user.id,
            content=content,
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)

        try:
            create_audit_log_sync(
                db,
                action_type="CREATE",
                resource_type="DISCUSSION",
                user_id=current_user.id,
                resource_id=msg.id,
                description="Posted an internal discussion message",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"event": "discussion_post", "submission_id": submission_id},
            )
        except Exception:
            pass

        return DiscussionMessageResponse(
            id=msg.id,
            submission_id=msg.submission_id,
            user_id=msg.user_id,
            user_name=getattr(current_user, "full_name", None) or getattr(current_user, "email", None),
            content=msg.content,
            created_at=msg.created_at,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

