from abc import ABC, abstractmethod
from typing import List, Optional
from infrastructure.models.conference_model import TrackModel


class TrackRepository(ABC):
    """Repository interface for Track operations."""
    
    @abstractmethod
    def create(self, track: TrackModel) -> TrackModel:
        """Create a new track."""
        pass
    
    @abstractmethod
    def get_by_id(self, track_id: int) -> Optional[TrackModel]:
        """Get track by ID."""
        pass
    
    @abstractmethod
    def get_by_conference(self, conference_id: int) -> List[TrackModel]:
        """Get all tracks for a conference."""
        pass
    
    @abstractmethod
    def update(self, track: TrackModel) -> TrackModel:
        """Update a track."""
        pass
    
    @abstractmethod
    def delete(self, track_id: int) -> None:
        """Delete a track."""
        pass

