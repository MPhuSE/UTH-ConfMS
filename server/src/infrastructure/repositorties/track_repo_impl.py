from typing import List, Optional
from sqlalchemy.orm import Session
from infrastructure.models.conference_model import TrackModel
from infrastructure.repositories_interfaces.track_repository import TrackRepository
from domain.exceptions import NotFoundError


class TrackRepositoryImpl(TrackRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, track: TrackModel) -> TrackModel:
        self.db.add(track)
        self.db.commit()
        self.db.refresh(track)
        return track
    
    def get_by_id(self, track_id: int) -> Optional[TrackModel]:
        return self.db.query(TrackModel).filter(TrackModel.id == track_id).first()
    
    def get_by_conference(self, conference_id: int) -> List[TrackModel]:
        return self.db.query(TrackModel).filter(
            TrackModel.conference_id == conference_id
        ).all()
    
    def update(self, track: TrackModel) -> TrackModel:
        existing = self.get_by_id(track.id)
        if not existing:
            raise NotFoundError(f"Track with id {track.id} not found")
        
        existing.name = track.name
        existing.max_reviewers = track.max_reviewers
        self.db.commit()
        self.db.refresh(existing)
        return existing
    
    def delete(self, track_id: int) -> None:
        track = self.get_by_id(track_id)
        if not track:
            raise NotFoundError(f"Track with id {track_id} not found")
        self.db.delete(track)
        self.db.commit()

