from sqlalchemy.orm import Session
from fastapi import HTTPException

from infrastructure.models.submission_model import SubmissionModel, SubmissionAuthorModel , SubmissionFileModel
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository


class SubmissionRepositoryImpl(SubmissionRepository):
    def __init__(self, db: Session):
        self.db = db
    def create(self, data: dict):
        new_submission = SubmissionModel(
            title=data.get('title'),
            abstract=data.get('abstract'),
            track_id=data.get('track_id'),
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
            user_id=data.get('author_id'),
            order_index=1,
            is_corresponding=True
        )
        self.db.add(new_author)
        self.db.commit()
        self.db.refresh(new_submission)
        return new_submission
    def get_by_id(self, submission_id: int):
        submission = self.db.query(SubmissionModel).filter(
            SubmissionModel.id == submission_id
        ).first()

        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        return submission

    def get_all(self):
        return self.db.query(SubmissionModel).all()

    def get_by_author(self, user_id: int):
        return (
            self.db.query(SubmissionModel)
            .join(SubmissionAuthorModel, SubmissionModel.id == SubmissionAuthorModel.submission_id)
            .filter(SubmissionAuthorModel.user_id == user_id)
            .all()
        )

    def update(self, submission_id: int, data: dict):
        submission = self.get_by_id(submission_id)

        for k, v in data.items():
            setattr(submission, k, v)

        self.db.commit()
        self.db.refresh(submission)

        return submission

    def delete(self, submission_id: int):
        submission = self.get_by_id(submission_id)

        self.db.delete(submission)
        self.db.commit()
