from typing import Optional, List
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func
from fastapi import HTTPException
from infrastructure.models.submission_model import (
    SubmissionModel, 
    SubmissionAuthorModel, 
    SubmissionFileModel
)
from infrastructure.models.conference_model import TrackModel
from infrastructure.models.user_model import UserModel
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository

class SubmissionRepositoryImpl(SubmissionRepository):
    def __init__(self, db: Session):
        self.db = db

    # 1. Triển khai phương thức get_all (Hỗ trợ lọc theo conference_id)
    def get_all(self, conference_id: Optional[int] = None):
        query = self.db.query(SubmissionModel).options(
            joinedload(SubmissionModel.track).joinedload(TrackModel.conference),
            selectinload(SubmissionModel.authors)
        )
        if conference_id:
            query = query.filter(SubmissionModel.conference_id == conference_id)
        return query.all()

    # 2. Triển khai phương thức create
    def create(self, data: dict):
        author_user = self.db.query(UserModel).filter(UserModel.id == data.get('author_id')).first()
        if not author_user:
            raise HTTPException(status_code=404, detail="Author user not found")

        new_submission = SubmissionModel(
            title=data.get('title'),
            abstract=data.get('abstract'),
            track_id=data.get('track_id'),
            conference_id=data.get('conference_id'),
            status="submitted"  # Theo SUBMISSION_WORKFLOW.md: status = "submitted" khi nộp bài mới
        )
        self.db.add(new_submission)
        self.db.flush() 

        new_file = SubmissionFileModel(
            submission_id=new_submission.id,
            file_path=data.get('file_url'),
            mime_type="application/pdf",
            write_type="Initial",
            version=1
        )
        self.db.add(new_file)

        authors_payload = data.get("authors")
        if authors_payload:
            author_rows = self._build_author_rows(
                authors_payload,
                submission_id=new_submission.id,
                fallback_user=author_user
            )
            for author_row in author_rows:
                self.db.add(author_row)
        else:
            new_author = SubmissionAuthorModel(
                submission_id=new_submission.id,
                user_id=author_user.id,
                full_name=author_user.full_name, 
                email=author_user.email,         
                order_index=1,
                is_corresponding=True
            )
            self.db.add(new_author)
        self.db.commit()
        self.db.refresh(new_submission)
        
        return self.get_by_id(new_submission.id)

    # 3. Triển khai phương thức get_by_id
    def get_by_id(self, submission_id: int):
        submission = (
            self.db.query(SubmissionModel)
            .options(
                joinedload(SubmissionModel.track).joinedload(TrackModel.conference),
                selectinload(SubmissionModel.authors),
                joinedload(SubmissionModel.camera_ready_file)
                
            )
            .filter(SubmissionModel.id == submission_id)
            .first()
        )
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        return submission

    # 4. Triển khai phương thức get_by_author
    def get_by_author(self, user_id: int):
        return (
            self.db.query(SubmissionModel)
            .join(SubmissionAuthorModel)
            .options(
                joinedload(SubmissionModel.track).joinedload(TrackModel.conference),
                selectinload(SubmissionModel.authors)
            )
            .filter(SubmissionAuthorModel.user_id == user_id)
            .all()
        )

    # 5. Triển khai phương thức update
    def update(self, submission_id: int, data: dict):
        submission = self.get_by_id(submission_id)
        authors_payload = data.pop("authors", None)
        author_id = data.pop("author_id", None)

        for k, v in data.items():
            if hasattr(submission, k):
                setattr(submission, k, v)

        if authors_payload is not None:
            fallback_user = None
            if author_id is not None:
                fallback_user = self.db.query(UserModel).filter(UserModel.id == author_id).first()
            submission.authors = self._build_author_rows(
                authors_payload,
                submission_id=submission.id,
                fallback_user=fallback_user
            )

        self.db.commit()
        self.db.refresh(submission)
        return submission

    # 6. Triển khai phương thức delete
    def delete(self, submission_id: int):
        submission = self.get_by_id(submission_id)
        self.db.delete(submission)
        self.db.commit()
        return True

    def _build_author_rows(self, authors_payload, submission_id: int, fallback_user):
        if not isinstance(authors_payload, list):
            raise HTTPException(status_code=400, detail="Authors must be a list")
        if len(authors_payload) == 0:
            raise HTTPException(status_code=400, detail="Authors list cannot be empty")

        used_user_ids = set()
        rows = []
        for idx, author in enumerate(authors_payload):
            if not isinstance(author, dict):
                raise HTTPException(status_code=400, detail="Invalid author item")

            email = (author.get("email") or "").strip()
            name = (author.get("name") or author.get("full_name") or "").strip()
            is_corresponding = bool(
                author.get("is_main")
                or author.get("is_corresponding")
                or idx == 0
            )

            user = None
            if email:
                email_lower = email.lower()
                user = (
                    self.db.query(UserModel)
                    .filter(func.lower(UserModel.email) == email_lower)
                    .first()
                )
            elif is_corresponding and fallback_user:
                user = fallback_user

            if not user:
                raise HTTPException(status_code=400, detail="Co-author email not found in system")

            if user.id in used_user_ids:
                raise HTTPException(status_code=400, detail="Duplicate co-author user")

            rows.append(SubmissionAuthorModel(
                submission_id=submission_id,
                user_id=user.id,
                full_name=name or user.full_name,
                email=email or user.email,
                order_index=idx + 1,
                is_corresponding=is_corresponding
            ))
            used_user_ids.add(user.id)

        return rows