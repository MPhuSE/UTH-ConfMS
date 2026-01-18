from sqlalchemy.orm import Session
from typing import List, Optional
from domain.models.conference import Conference
from infrastructure.models.conference_model import ConferenceModel
from infrastructure.repositories_interfaces.conference_repository import ConferenceRepository # pyright: ignore[reportMissingImports]
from domain.exceptions import NotFoundError

class ConferenceRepositoryImpl(ConferenceRepository):

    def __init__(self, db: Session):
        self.db = db

    def _model_to_domain(self, model: ConferenceModel) -> Conference:
        """Convert ConferenceModel to Conference domain model."""
        return Conference(
            id=model.id,
            name=model.name,
            abbreviation=model.abbreviation,
            description=model.description,
            website=model.website,
            location=model.location,
            start_date=model.start_date,
            end_date=model.end_date,
            submission_deadline=model.submission_deadline,
            review_deadline=model.review_deadline,
            is_open=model.is_open,
            blind_mode=model.blind_mode or 'double'
        )

    def create(self, conference: Conference) -> Conference:
        model = ConferenceModel(
            name=conference.name,
            abbreviation=conference.abbreviation,
            description=conference.description,
            website=conference.website,
            location=conference.location,
            start_date=conference.start_date,
            end_date=conference.end_date,
            submission_deadline=conference.submission_deadline,
            review_deadline=conference.review_deadline,
            is_open=conference.is_open,
            blind_mode=conference.blind_mode or 'double'
        )

        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)

        return self._model_to_domain(model)

    # --- HÀM SAVE MỚI ĐỂ PHỤC VỤ CFP VÀ CÁC LOGIC KHÁC ---
    def save(self, conference: Conference) -> Conference:
        """
        Lưu hoặc Cập nhật Conference. 
        Nếu có ID thì update, nếu chưa có thì create.
        """
        if conference.id:
            return self.update(conference)
        else:
            return self.create(conference)

    def get_by_id(self, conference_id: int) -> Optional[Conference]:
        """Get conference by ID."""
        model = self.db.query(ConferenceModel).filter(ConferenceModel.id == conference_id).first()
        if model is None:
            return None
        return self._model_to_domain(model)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Conference]:
        """Get all conferences with pagination."""
        models = self.db.query(ConferenceModel).offset(skip).limit(limit).all()
        return [self._model_to_domain(model) for model in models]

    def count_all(self) -> int:
        """Count total number of conferences."""
        return self.db.query(ConferenceModel).count()

    def delete(self, conference_id: int) -> None:
        """Delete a conference by ID."""
        model = self.db.query(ConferenceModel).filter(ConferenceModel.id == conference_id).first()
        if model is None:
            raise NotFoundError(f"Conference with id {conference_id} not found")
        self.db.delete(model)
        self.db.commit()

    def update(self, conference: Conference) -> Conference:
        """Update an existing conference."""
        model = self.db.query(ConferenceModel).filter(ConferenceModel.id == conference.id).first()
        if model is None:
            raise NotFoundError(f"Conference with id {conference.id} not found")

        # Update fields
        model.name = conference.name
        model.abbreviation = conference.abbreviation
        model.description = conference.description
        model.website = conference.website
        model.location = conference.location
        model.start_date = conference.start_date
        model.end_date = conference.end_date
        model.submission_deadline = conference.submission_deadline
        model.review_deadline = conference.review_deadline
        model.is_open = conference.is_open
        model.blind_mode = conference.blind_mode or 'double'

        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)

        return self._model_to_domain(model)