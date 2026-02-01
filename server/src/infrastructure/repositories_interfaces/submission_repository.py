from typing import List, Optional, Any
from abc import ABC, abstractmethod


class SubmissionRepository(ABC):

    @abstractmethod
    def get_by_id(self, submission_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def get_all(self, conference_id: Optional[int] = None, tenant_id: Optional[int] = None) -> List[Any]:
        pass

    @abstractmethod
    def get_by_author(self, user_id: int) -> List[Any]:
        pass

    @abstractmethod
    def update(self, submission_id: int, data: dict) -> Any:
        pass

    @abstractmethod
    def delete(self, submission_id: int) -> None:
        pass
