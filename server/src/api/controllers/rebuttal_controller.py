from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from infrastructure.databases.postgres import get_db
from infrastructure.security.rbac import require_author, require_any_role
from api.schemas.rebuttal_schema import RebuttalCreateRequest, RebuttalResponse
from infrastructure.models.rebuttal_model import RebuttalModel
from infrastructure.models.submission_model import SubmissionModel, SubmissionAuthorModel
from infrastructure.models.conference_model import ConferenceModel
from api.utils.audit_utils import create_audit_log_sync


router = APIRouter(prefix="/rebuttals", tags=["Rebuttals"])


def _utcnow():
    return datetime.now(timezone.utc)


@router.get("/{submission_id}", response_model=RebuttalResponse)
def get_rebuttal(
    submission_id: int,
    req: Request,
    current_user=Depends(require_any_role("chair", "reviewer", "admin")),
    db: Session = Depends(get_db),
):
    rebuttal = db.query(RebuttalModel).filter(RebuttalModel.submission_id == submission_id).first()
    if not rebuttal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rebuttal not found")

    try:
        create_audit_log_sync(
            db,
            action_type="VIEW",
            resource_type="REBUTTAL",
            user_id=current_user.id,
            resource_id=rebuttal.id,
            description="Viewed rebuttal for a submission",
            ip_address=req.client.host if req and req.client else None,
            user_agent=req.headers.get("user-agent") if req else None,
            metadata={"event": "rebuttal_view", "submission_id": submission_id},
        )
    except Exception:
        pass

    return RebuttalResponse.model_validate(rebuttal)


@router.post("", response_model=RebuttalResponse, status_code=status.HTTP_201_CREATED)
def submit_rebuttal(
    payload: RebuttalCreateRequest,
    req: Request,
    current_user=Depends(require_author),
    db: Session = Depends(get_db),
):
    content = (payload.content or "").strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Content is required")

    submission = db.query(SubmissionModel).filter(SubmissionModel.id == payload.submission_id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    # Must be an author of this submission
    is_author = (
        db.query(SubmissionAuthorModel)
        .filter(
            SubmissionAuthorModel.submission_id == payload.submission_id,
            SubmissionAuthorModel.user_id == current_user.id,
        )
        .first()
        is not None
    )
    if not is_author:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to rebut for this submission")

    # Conference gate (optional): require rebuttal_open and before rebuttal_deadline if set
    conf = db.query(ConferenceModel).filter(ConferenceModel.id == submission.conference_id).first()
    if conf is not None:
        rebuttal_open = bool(getattr(conf, "rebuttal_open", False))
        rebuttal_deadline = getattr(conf, "rebuttal_deadline", None)
        now = _utcnow()
        if not rebuttal_open:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rebuttal phase is not open")
        if rebuttal_deadline is not None and now > rebuttal_deadline:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rebuttal deadline has passed")

    existing = db.query(RebuttalModel).filter(RebuttalModel.submission_id == payload.submission_id).first()
    try:
        if existing:
            existing.content = content
            existing.updated_at = datetime.utcnow()
            db.add(existing)
            db.commit()
            db.refresh(existing)
            rebuttal = existing
            action = "UPDATE"
        else:
            rebuttal = RebuttalModel(submission_id=payload.submission_id, author_id=current_user.id, content=content)
            db.add(rebuttal)
            db.commit()
            db.refresh(rebuttal)
            action = "CREATE"

        try:
            create_audit_log_sync(
                db,
                action_type=action,
                resource_type="REBUTTAL",
                user_id=current_user.id,
                resource_id=rebuttal.id,
                description="Submitted rebuttal",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"event": "rebuttal_submit", "submission_id": payload.submission_id},
            )
        except Exception:
            pass

        return RebuttalResponse.model_validate(rebuttal)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

