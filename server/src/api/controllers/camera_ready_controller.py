from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session

from api.schemas.camera_ready_schema import CameraReadyUploadRequest, CameraReadyResponse
from infrastructure.databases.postgres import get_db
from infrastructure.repositorties.submission_repo_impl import SubmissionRepositoryImpl
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.external_services.cloudinary_service import CloudinaryService
from services.camera_ready.camera_ready_service import CameraReadyService
from domain.exceptions import NotFoundError, BusinessRuleException

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
        return CameraReadyResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/submissions/{submission_id}", response_model=CameraReadyResponse)
def get_camera_ready(
    submission_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_camera_ready_service)
):
    """Get camera-ready file for a submission."""
    try:
        result = service.get_camera_ready(submission_id)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera-ready not found")
        return CameraReadyResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

