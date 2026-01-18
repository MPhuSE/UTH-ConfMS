# infrastructure/repositories/submission_repo_impl.py

from sqlalchemy.orm import Session, joinedload, selectinload
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

    # 1. Triển khai phương thức get_all (Đây là hàm đang gây lỗi)
    def get_all(self):
        return (
            self.db.query(SubmissionModel)
            .options(
                joinedload(SubmissionModel.track).joinedload(TrackModel.conference),
                selectinload(SubmissionModel.authors)
            )
            .all()
        )

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
            status="Submitted"
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
        for k, v in data.items():
            if hasattr(submission, k):
                setattr(submission, k, v)
        self.db.commit()
        self.db.refresh(submission)
        return submission

    # 6. Triển khai phương thức delete
    def delete(self, submission_id: int):
        submission = self.get_by_id(submission_id)
        self.db.delete(submission)
        self.db.commit()
        return True