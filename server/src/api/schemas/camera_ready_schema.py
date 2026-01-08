from pydantic import BaseModel
from typing import Optional


class CameraReadyUploadRequest(BaseModel):
    submission_id: int
    file_url: str


class CameraReadyResponse(BaseModel):
    submission_id: int
    camera_ready_file_id: int
    file_url: str

