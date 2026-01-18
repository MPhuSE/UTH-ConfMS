from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Request
from sqlalchemy.orm import Session

from api.schemas.camera_ready_schema import CameraReadyUploadRequest, CameraReadyResponse
from infrastructure.databases.postgres import get_db
from infrastructure.repositories.submission_repo_impl import SubmissionRepositoryImpl
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.external_services.cloudinary_service import CloudinaryService
from services.camera_ready.camera_ready_service import CameraReadyService
from domain.exceptions import NotFoundError, BusinessRuleException
from api.utils.audit_utils import create_audit_log_sync

router = APIRouter(prefix="/camera-ready", tags=["Camera-Ready"])


def get_submission_repo(db: Session = Depends(get_db)):
    return SubmissionRepositoryImpl(db)


def get_camera_ready_service(
    submission_repo=Depends(get_submission_repo),
    db=Depends(get_db)
):
    return CameraReadyService(submission_repo, db)


@router.post("/upload", response_model=CameraReadyResponse, status_code=status.HTTP_201_CREATED)
async def upload_camera_ready(
    submission_id: int,
    file: UploadFile = File(...),
    req: Request = None,
    current_user=Depends(get_current_user),
    service=Depends(get_camera_ready_service)
):
    """Upload camera-ready version of a submission."""
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
        
        # Upload to cloud
        file_url = await CloudinaryService.upload_pdf(file)
        
        result = service.upload_camera_ready(
            submission_id=submission_id,
            file_url=file_url
        )

        # Audit: SUBMIT camera-ready
        try:
            create_audit_log_sync(
                service.db,
                action_type="SUBMIT",
                resource_type="SUBMISSION",
                user_id=current_user.id,
                resource_id=submission_id,
                description="Uploaded camera-ready PDF",
                new_values={"submission_id": submission_id, "file_url": file_url},
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"event": "camera_ready_upload"},
            )
        except Exception:
            pass
        return CameraReadyResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/submissions/{submission_id}", response_model=CameraReadyResponse)
def get_camera_ready(
    submission_id: int,
    req: Request,
    current_user=Depends(get_current_user),
    service=Depends(get_camera_ready_service)
):
    try:
        # Service này phải truy vấn vào bảng 'submissions' để lấy cột 'camera_ready_submission'
        result = service.get_camera_ready(submission_id)
        if not result:
             raise HTTPException(status_code=404, detail="Camera-ready not found")
             
        # Đảm bảo CameraReadyResponse chấp nhận trường 'camera_ready_submission' thay vì 'id'
        resp = CameraReadyResponse(
            submission_id=result["submission_id"],
            camera_ready_submission=result["camera_ready_submission"],
            file_url=result["file_url"]
        )

        # Audit: VIEW camera-ready
        try:
            create_audit_log_sync(
                service.db,
                action_type="VIEW",
                resource_type="SUBMISSION",
                user_id=current_user.id,
                resource_id=submission_id,
                description="Viewed camera-ready file",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"event": "camera_ready_view"},
            )
        except Exception:
            pass
        return resp
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))