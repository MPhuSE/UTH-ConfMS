from abc import ABC, abstractmethod
from typing import Optional, List
from infrastructure.models.user_model import UserModel

class UserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[UserModel]:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[UserModel]:
        pass

    @abstractmethod
    async def get_by_sso(self, provider: str, sso_id: str) -> Optional[UserModel]:
        pass

    @abstractmethod
    async def get_user_by_role(self, role_id: int) -> List[UserModel]:
        """Tìm tất cả người dùng có vai trò cụ thể."""
        pass

    @abstractmethod
    async def save(self, user: UserModel) -> UserModel:
        """Lưu hoặc cập nhật người dùng."""
        pass
    

    #CRUD user management
    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[UserModel]:
        """Lấy tất cả người dùng."""
        pass
    @abstractmethod
    async def delete(self, user_id: int) -> None:
        """Xóa người dùng."""
        pass
    @abstractmethod
    async def update(self, user: UserModel) -> UserModel:
        """Cập nhật người dùng."""
        pass
    async def create(self, user: UserModel) -> UserModel:
        """Tạo người dùng."""
        pass

    @abstractmethod
    async def search_users(self, query: str, limit: int = 10) -> List[UserModel]:
        """Tìm kiếm người dùng theo email hoặc tên."""
        pass