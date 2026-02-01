from typing import List, Optional
from domain.models.conference import Conference
from domain.exceptions import NotFoundError
from infrastructure.repositories_interfaces.conference_repository import ConferenceRepository  # pyright: ignore[reportMissingImports]

class GetConferenceService:

    def __init__(self, repo: ConferenceRepository):
        self.repo = repo

    def get_by_id(self, conference_id: int) -> Conference:
        """Get conference by ID. Raises NotFoundError if not found."""
        conference = self.repo.get_by_id(conference_id)
        if conference is None:
            raise NotFoundError(f"Conference with id {conference_id} not found")
        return conference

    def get_all(self, skip: int = 0, limit: int = 100, tenant_id: Optional[int] = None) -> List[Conference]:
        """Get all conferences with pagination and tenant filtering."""
        return self.repo.get_all(skip=skip, limit=limit, tenant_id=tenant_id)

    def count_all(self, tenant_id: Optional[int] = None) -> int:
        """Count total number of conferences."""
        return self.repo.count_all(tenant_id=tenant_id)

