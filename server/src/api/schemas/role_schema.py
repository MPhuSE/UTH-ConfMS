from pydantic import BaseModel
from typing import List


class RoleResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class RoleListResponse(BaseModel):
    roles: List[RoleResponse]

