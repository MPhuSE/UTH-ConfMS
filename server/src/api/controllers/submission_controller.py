import datetime
from fastapi import APIRouter, Depends
from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile 
from typing import List
from dependency_container import get_submission_repo, get_conference_repo
from api.schemas.submission_schema import (
    SubmissionPatchSchema,
    SubmissionResponseSchema
)


from dependency_container import get_submission_repo
from infrastructure.security.auth_dependencies import get_current_user
from services.submission.get_submission import GetSubmissionService
from services.submission.list_submissions import ListSubmissionsService
from services.submission.edit_submission import EditSubmissionService
from services.submission.delete_submission import DeleteSubmissionService
from services.submission.create_submission import CreateSubmissionService
from infrastructure.external_services.cloudinary_service import CloudinaryService


router = APIRouter(prefix="/submissions", tags=["Submissions"])
@router.post("/", response_model=SubmissionResponseSchema, status_code=status.HTTP_201_CREATED)
async def submit_paper(
    title: str = Form(...),
    abstract: str = Form(...),
    track_id: int = Form(...),
    conference_id: int = Form(...),
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    repo = Depends(get_submission_repo),
    conf_repo = Depends(get_conference_repo) 
):
    try:
        conference = conf_repo.get_by_id(conference_id)
        if not conference:
            raise HTTPException(status_code=404, detail="Conference not found")
        
        if datetime.datetime.now() > conference.submission_deadline:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="The submission deadline for this conference has passed."
            )


        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
        
        # Gọi service upload cloud
        file_url = await CloudinaryService.upload_pdf(file)

        # 3. CNPM-58: Thực hiện lưu bài nộp (API submit paper)
        service = CreateSubmissionService(repo)
        result = service.execute(
            title=title,
            abstract=abstract,
            track_id=track_id,
            conference_id=conference_id,
            author_id=current_user.id,
            file_url=file_url
        )
        return result

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"An error occurred during submission: {str(e)}"
        )

@router.get("/", response_model=List[SubmissionResponseSchema])
def list_submissions(
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo)
):
    """List all submissions - requires authentication."""
    return ListSubmissionsService(repo).execute()


@router.get("/me", response_model=List[SubmissionResponseSchema])
def list_my_submissions(
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo),
):

    return repo.get_by_author(current_user.id)


@router.get("/{submission_id}", response_model=SubmissionResponseSchema)
def get_submission(
    submission_id: int,
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo)
):
    """Get a submission - requires authentication."""
    return GetSubmissionService(repo).execute(submission_id)


@router.patch("/{submission_id}", response_model=SubmissionResponseSchema)
def update_submission(
    submission_id: int,
    payload: SubmissionPatchSchema,
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo)
):
    """Update submission - only author or admin/chair can update."""
    # TODO: Add ownership check - only author or admin/chair can update
    data = payload.dict(exclude_none=True)
    return EditSubmissionService(repo).execute(submission_id, data)


@router.delete("/{submission_id}")
def delete_submission(
    submission_id: int,
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo)
):
    """Delete submission - only author or admin/chair can delete."""
    # TODO: Add ownership check - only author or admin/chair can delete
    DeleteSubmissionService(repo).execute(submission_id)
    return {"message": "Submission deleted successfully"}
