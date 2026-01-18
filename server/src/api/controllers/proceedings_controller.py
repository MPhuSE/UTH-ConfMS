from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional

from infrastructure.databases.postgres import get_db
from infrastructure.security.rbac import require_admin_or_chair
from infrastructure.models.conference_model import ConferenceModel
from infrastructure.models.submission_model import SubmissionModel, SubmissionAuthorModel
from infrastructure.models.system_model import ScheduleItemModel


router = APIRouter(prefix="/proceedings", tags=["Proceedings"])


@router.get("/conferences/{conference_id}/export")
def export_proceedings(conference_id: int, current_user=Depends(require_admin_or_chair), db: Session = Depends(get_db)):
    """
    Export accepted papers for program/proceedings.
    Returns JSON (easy to download and post-process to PDF/LaTeX later).
    """
    conf = db.query(ConferenceModel).filter(ConferenceModel.id == conference_id).first()
    if not conf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conference not found")

    subs = (
        db.query(SubmissionModel)
        .filter(SubmissionModel.conference_id == conference_id)
        .all()
    )

    accepted: List[Dict[str, Any]] = []
    for s in subs:
        decision_value = (getattr(s, "decision", None) or getattr(s, "status", None) or "").lower().strip()
        if decision_value not in ("accepted", "accept"):
            continue

        authors = (
            db.query(SubmissionAuthorModel)
            .filter(SubmissionAuthorModel.submission_id == s.id)
            .order_by(SubmissionAuthorModel.order_index.asc())
            .all()
        )

        sched = db.query(ScheduleItemModel).filter(ScheduleItemModel.submission_id == s.id).order_by(ScheduleItemModel.order_index.asc()).all()
        schedule_items = [
            {
                "id": it.id,
                "lesson_id": it.lesson_id,
                "start_time": it.start_time,
                "end_time": it.end_time,
                "order_index": it.order_index,
            }
            for it in sched
        ]

        accepted.append(
            {
                "submission_id": s.id,
                "conference_id": s.conference_id,
                "track_id": s.track_id,
                "title": s.title,
                "abstract": s.abstract,
                "decision": getattr(s, "decision", None) or getattr(s, "status", None),
                "avg_score": float(s.avg_score) if getattr(s, "avg_score", None) is not None else None,
                "camera_ready_submission": s.camera_ready_submission,
                "file_url": s.file_path,
                "authors": [
                    {
                        "user_id": a.user_id,
                        "name": a.full_name,
                        "email": a.email,
                        "order_index": a.order_index,
                        "is_corresponding": a.is_corresponding,
                    }
                    for a in authors
                ],
                "schedule": schedule_items,
            }
        )

    return {
        "conference": {
            "id": conf.id,
            "name": conf.name,
            "abbreviation": conf.abbreviation,
        },
        "count": len(accepted),
        "papers": accepted,
    }

