from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from infrastructure.models.submission_model import SubmissionModel, SubmissionFileModel
from domain.exceptions import NotFoundError, BusinessRuleException


class CameraReadyService:
    """Service for managing camera-ready submissions."""
    
    def __init__(
        self,
        submission_repo: SubmissionRepository,
        db: Session
    ):
        self.submission_repo = submission_repo
        self.db = db
    
    def upload_camera_ready(
        self,
        submission_id: int,
        file_url: str
    ) -> Dict[str, Any]:
        """Upload camera-ready version of a submission."""
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        # SỬA LỖI: Kiểm tra cả status hoặc decision tùy theo logic DB của bạn
        if submission.status != "accepted" and submission.decision != "accepted":
            raise BusinessRuleException(
                "Camera-ready can only be uploaded for accepted submissions"
            )
        
        # Create camera-ready file
        camera_ready_file = SubmissionFileModel(
            submission_id=submission_id,
            file_path=file_url,
            mime_type="application/pdf",
            write_type="Camera-Ready",
            version=1
        )
        self.db.add(camera_ready_file)
        self.db.flush()
        
        # Update submission to link camera-ready file
        update_data = {
            "camera_ready_submission": camera_ready_file.id
        }
        updated = self.submission_repo.update(submission_id, update_data)
        
        # ĐỒNG BỘ KEY TRẢ VỀ:
        return {
            "submission_id": updated.id,
            "camera_ready_submission": camera_ready_file.id, # Sửa từ camera_ready_file_id
            "file_url": file_url
        }
    
    def get_camera_ready(self, submission_id: int) -> Optional[Dict[str, Any]]:
        """Get camera-ready file for a submission."""
        # Truy vấn lấy cả quan hệ camera_ready_file để có file_path
        submission = self.submission_repo.get_by_id(submission_id)
        
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        if not submission.camera_ready_submission:
            return None
        
        # Lấy file path từ property hoặc relationship
        file_url = submission.file_path 
        
        # QUAN TRỌNG: Key trả về phải khớp 100% với Schema CameraReadyResponse
        return {
            "submission_id": submission.id,
            "camera_ready_submission": submission.camera_ready_submission, # Trả về số 25, 26
            "file_url": file_url,
            "version": 1
        }