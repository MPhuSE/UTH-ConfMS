from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from infrastructure.models.submission_model import SubmissionModel, SubmissionFileModel
from infrastructure.models.conference_model import ConferenceModel
from domain.exceptions import NotFoundError, BusinessRuleException
from datetime import datetime, timezone


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
        
        # QUY TẮC: Chỉ upload camera-ready khi decision = "accepted"
        # Theo SUBMISSION_WORKFLOW.md - Section 4: Camera-Ready Upload
        # - Điều kiện: decision = "accepted" (hoặc "accept")
        # - Sau khi upload thành công: status = "published"
        # - Decision là trường quyết định, không phải status
        # - Decision values: accepted, rejected, minor_revision, major_revision
        # - Status values: submitted, under_review, accepted, rejected, published, withdrawn
        decision_val = (getattr(submission, "decision", None) or "").lower().strip()
        status_val = (getattr(submission, "status", None) or "").lower().strip()
        
        # Debug logging
        print(f"[CameraReady] Submission {submission_id}: decision='{decision_val}', status='{status_val}'")
        
        # Kiểm tra decision phải = "accepted" (đây là điều kiện bắt buộc)
        # Không cần kiểm tra camera_ready_open flag
        # Chỉ kiểm tra camera_ready_deadline nếu có
        if decision_val not in ("accepted", "accept"):
            error_msg = f"Camera-ready can only be uploaded for accepted submissions. Current decision: {decision_val or 'none'}"
            print(f"[CameraReady] Validation failed: {error_msg}")
            raise BusinessRuleException(error_msg)
        
        # Kiểm tra camera_ready_open
        # FIX: Phải kiểm tra cờ này để đảm bảo Chair đã mở cổng
        conf = self.db.query(ConferenceModel).filter(ConferenceModel.id == submission.conference_id).first()
        if conf is None:
             raise BusinessRuleException("Conference not found")

        if not getattr(conf, "camera_ready_open", False):
             raise BusinessRuleException("Camera-ready submission is currently closed for this conference (Cổng nộp bản cuối đang đóng)")
        
        # Kiểm tra camera-ready deadline nếu có cấu hình
        deadline = getattr(conf, "camera_ready_deadline", None)
        if deadline is not None:
            now = datetime.now(timezone.utc)
            # Đảm bảo deadline có timezone
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            if now > deadline:
                raise BusinessRuleException("Camera-ready deadline has passed")
        
        # Create camera-ready file
        try:
            camera_ready_file = SubmissionFileModel(
                submission_id=submission_id,
                file_path=file_url,
                mime_type="application/pdf",
                write_type="Camera-Ready",
                version=1
            )
            self.db.add(camera_ready_file)
            self.db.flush()  # Flush để lấy ID
            print(f"[CameraReady] Created file record: id={camera_ready_file.id}")
        except Exception as e:
            print(f"[CameraReady] Error creating file record: {e}")
            import traceback
            traceback.print_exc()
            self.db.rollback()
            raise BusinessRuleException(f"Failed to create camera-ready file: {str(e)}")
        
        # Update submission to link camera-ready file và set status = "published"
        # Sau khi upload camera-ready thành công, status được cập nhật thành "published"
        actual_status = "published"  # Mặc định là "published"
        updated = None
        try:
            update_data = {
                "camera_ready_submission": camera_ready_file.id,
                "status": "published"  # Cập nhật status thành "published" sau khi upload camera-ready
            }
            print(f"[CameraReady] Updating submission {submission_id} with data: {update_data}")
            
            # Update qua repository
            updated = self.submission_repo.update(submission_id, update_data)
            
            # QUAN TRỌNG: Đảm bảo status được set đúng bằng cách update trực tiếp vào DB
            # Có thể repository update không set status đúng, nên cần update trực tiếp
            submission_obj = self.submission_repo.get_by_id(submission_id)
            if submission_obj:
                # Kiểm tra và update trực tiếp nếu cần
                current_status = getattr(submission_obj, "status", None)
                print(f"[CameraReady] Status after repo.update(): {current_status}")
                
                if current_status != "published":
                    print(f"[CameraReady] Status is '{current_status}', updating directly to 'published'...")
                    submission_obj.status = "published"
                    self.db.commit()
                    self.db.refresh(submission_obj)
                    actual_status = getattr(submission_obj, "status", "published")
                    print(f"[CameraReady] Direct DB update completed - status: {actual_status}")
                else:
                    actual_status = "published"
            else:
                actual_status = "published"
            
            print(f"[CameraReady] Final: submission {submission_id}, status={actual_status}, camera_ready_file_id={camera_ready_file.id}")
        except Exception as e:
            print(f"[CameraReady] Error updating submission: {e}")
            import traceback
            traceback.print_exc()
            self.db.rollback()
            raise BusinessRuleException(f"Failed to update submission: {str(e)}")
        
        # ĐỒNG BỘ KEY TRẢ VỀ:
        # Sử dụng actual_status đã được kiểm tra ở trên
        return {
            "submission_id": updated.id if updated else submission_id,
            "camera_ready_submission": camera_ready_file.id, # Sửa từ camera_ready_file_id
            "file_url": file_url,
            "status": actual_status  # QUAN TRỌNG: Trả về status = "published" để frontend cập nhật
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