from abc import ABC, abstractmethod
from typing import List, Optional
from domain.models.conference import Conference

class ConferenceRepository(ABC):

    @abstractmethod
    def create(self, conference: Conference) -> Conference:
        pass

    @abstractmethod
    def save(self, conference: Conference) -> Conference:
        """Lưu hoặc cập nhật thông tin hội nghị (Dùng cho logic Service)."""
        pass

    @abstractmethod
    def get_by_id(self, conference_id: int) -> Optional[Conference]:
        pass

    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100, tenant_id: Optional[int] = None) -> List[Conference]:
        pass

    @abstractmethod
    def count_all(self) -> int:
        pass

    @abstractmethod
    def delete(self, conference_id: int) -> None:
        """Delete a conference by its ID."""
        pass

    @abstractmethod
    def update(self, conference: Conference) -> Conference:
        """Update an existing conference and return the updated domain object."""
        pass