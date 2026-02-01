import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile, Query
from starlette.requests import Request
from typing import List, Optional
from dependency_container import get_submission_repo, get_conference_repo, get_system_repo
from api.schemas.submission_schema import (
    SubmissionPatchSchema,
    SubmissionResponseSchema
)


from infrastructure.security.auth_dependencies import get_current_user
from services.submission.get_submission import GetSubmissionService
from services.submission.list_submissions import ListSubmissionsService
from services.submission.edit_submission import EditSubmissionService
from services.submission.delete_submission import DeleteSubmissionService
from services.submission.create_submission import CreateSubmissionService
from infrastructure.external_services.cloudinary_service import CloudinaryService
from api.utils.audit_utils import create_audit_log_sync
from infrastructure.security.tenant_dependency import validate_conference_tenant, validate_submission_tenant, get_current_tenant
from infrastructure.models.tenant_model import TenantModel


router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.post("/", response_model=SubmissionResponseSchema, status_code=status.HTTP_201_CREATED)
async def submit_paper(
    title: str = Form(...),
    abstract: str = Form(...),
    track_id: int = Form(...),
    conference_id: int = Form(...),
    file: UploadFile = File(...),
    authors: str = Form(None),
    req: Request = None,
    current_user = Depends(get_current_user),
    repo = Depends(get_submission_repo),
    conf_repo = Depends(get_conference_repo),
    system_repo = Depends(get_system_repo),
    valid_conf_id: int = Depends(validate_conference_tenant)
):
    try:
        # Check overall system file size limit if configured
        settings = system_repo.get_settings()
        if settings.quota_max_file_size_mb:
            # Note: file.size is already available in FastAPI/Starlette UploadFile
            if file.size > (settings.quota_max_file_size_mb * 1024 * 1024):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Dung lượng file quá lớn. Giới hạn tối đa là {settings.quota_max_file_size_mb}MB."
                )

        conference = conf_repo.get_by_id(conference_id)
        if not conference:
            raise HTTPException(status_code=404, detail="Conference not found")
        
        if datetime.datetime.now() > conference.submission_deadline:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="The submission deadline for this conference has passed."
            )

        # 3. Kiểm tra định dạng file - CHỈ CHẤP NHẬN PDF
        if not file.content_type or file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Chỉ chấp nhận file PDF (.pdf). File hiện tại không phải PDF.")
        
        # Kiểm tra đuôi file phải là .pdf
        if file.filename and not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Chỉ chấp nhận file có đuôi .pdf")

        file_url = await CloudinaryService.upload_pdf(file)
        
        authors_payload = None
        if authors:
            try:
                authors_payload = json.loads(authors)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid authors payload")
            if not isinstance(authors_payload, list):
                raise HTTPException(status_code=400, detail="Authors must be a list")

        service = CreateSubmissionService(repo, system_repo)
        result = service.execute(
            title=title,
            abstract=abstract,
            track_id=track_id,
            conference_id=conference_id,
            author_id=current_user.id,
            file_url=file_url,
            authors=authors_payload
        )

        full_submission = repo.get_by_id(result.id)

        try:
            create_audit_log_sync(
                repo.db,
                action_type="SUBMIT",
                resource_type="SUBMISSION",
                user_id=current_user.id,
                resource_id=full_submission.id,
                description="Author submitted a paper",
                new_values={
                    "id": full_submission.id,
                    "title": full_submission.title,
                    "conference_id": full_submission.conference_id,
                    "track_id": full_submission.track_id,
                    "file_path": full_submission.file_path,
                },
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"event": "submission_create", "pdf_uploaded": True},
            )
        except Exception:
            pass
        
        return full_submission

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Submission Error Traceback: {str(e)}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"An error occurred during submission: {str(e)}"
        )

@router.get("", response_model=List[SubmissionResponseSchema])
def list_submissions(
    conference_id: Optional[int] = Query(None, description="ID của hội nghị"),
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo),
    valid_conf_id: Optional[int] = Depends(validate_conference_tenant),
    tenant: Optional[TenantModel] = Depends(get_current_tenant)
):
    """List all submissions for a specific conference or within a tenant - requires authentication."""
    tenant_id = tenant.id if tenant else None
    return ListSubmissionsService(repo).execute(conference_id=conference_id, tenant_id=tenant_id)


@router.get("/me", response_model=List[SubmissionResponseSchema])
def list_my_submissions(
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo),
):

    return repo.get_by_author(current_user.id)


@router.get("/{submission_id}/download")
async def download_submission_pdf(
    submission_id: int,
    req: Request,
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo),
    redirect: bool = Query(True, description="Whether to redirect or return JSON"),
    valid_id: int = Depends(validate_submission_tenant)
):
    """Download PDF file của submission - Trả về download URL hoặc redirect"""
    from fastapi.responses import RedirectResponse
    
    try:
        # Lấy submission từ database (qua GetSubmissionService)
        submission = GetSubmissionService(repo).execute(submission_id)
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Lấy file_path từ database (bảng submission_files)
        file_url = submission.get("file_path") or submission.get("file_url")
        if not file_url:
            raise HTTPException(status_code=404, detail="File not found for this submission")
        
        # Tạo download URL với fl_attachment
        submission_title = submission.get("title", "")
        filename = f"{submission_title[:50] if submission_title else 'paper'}_{submission_id}.pdf"
        filename = "".join(c if c.isalnum() or c in ['_', '-', '.'] else '_' for c in filename)
        
        download_url = CloudinaryService.get_download_url(file_url, filename)
        
        # Audit: DOWNLOAD submission PDF
        try:
            create_audit_log_sync(
                repo.db,
                action_type="DOWNLOAD",
                resource_type="SUBMISSION",
                user_id=current_user.id,
                resource_id=submission_id,
                description="Downloaded submission PDF",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"event": "submission_download", "file_url": file_url},
            )
        except Exception:
            pass
        
        if not redirect:
            return {"download_url": download_url, "filename": filename}
        
        return RedirectResponse(url=download_url, status_code=302)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Download error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")

@router.get("/{submission_id}", response_model=SubmissionResponseSchema, response_model_exclude_none=False)
def get_submission(
    submission_id: int,
    req: Request,
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo),
    valid_id: int = Depends(validate_submission_tenant)
):
    """Lấy chi tiết bài nộp - Yêu cầu đăng nhập."""
    submission_dict = GetSubmissionService(repo).execute(submission_id)
    
    if 'avg_score' not in submission_dict:
        submission_dict['avg_score'] = None
    if 'final_score' not in submission_dict:
        submission_dict['final_score'] = None
    
    submission = SubmissionResponseSchema(**submission_dict)

    try:
        create_audit_log_sync(
            repo.db,
            action_type="VIEW",
            resource_type="SUBMISSION",
            user_id=current_user.id,
            resource_id=submission_id,
            description="Viewed submission detail",
            ip_address=req.client.host if req and req.client else None,
            user_agent=req.headers.get("user-agent") if req else None,
            metadata={"event": "submission_view"},
        )
    except Exception:
        pass
    return submission

@router.patch("/{submission_id}", response_model=SubmissionResponseSchema)
async def update_submission(
    submission_id: int,
    title: str = Form(None),
    abstract: str = Form(None),
    status: str = Form(None),
    file: UploadFile = File(None), 
    authors: str = Form(None),
    req: Request = None,
    current_user = Depends(get_current_user),
    repo = Depends(get_submission_repo),
    valid_id: int = Depends(validate_submission_tenant)
):
    """Update submission - Hỗ trợ cả text và file PDF."""
    
    submission = GetSubmissionService(repo).execute(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    before = submission

    update_data = {}
    if title is not None: update_data["title"] = title
    if abstract is not None: update_data["abstract"] = abstract
    if status is not None: update_data["status"] = status
    if authors is not None:
        try:
            authors_payload = json.loads(authors)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid authors payload")
        if not isinstance(authors_payload, list):
            raise HTTPException(status_code=400, detail="Authors must be a list")
        update_data["authors"] = authors_payload
        update_data["author_id"] = current_user.id

 
    if file:
        if not file.content_type or file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Chỉ chấp nhận file PDF (.pdf). File hiện tại không phải PDF.")
        
        if file.filename and not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Chỉ chấp nhận file có đuôi .pdf")
        

        new_file_url = await CloudinaryService.upload_pdf(file)
        update_data["file_url"] = new_file_url

    updated = EditSubmissionService(repo).execute(submission_id, update_data)

    try:
        old_title = before.get("title") if isinstance(before, dict) else getattr(before, "title", None)
        old_abstract = before.get("abstract") if isinstance(before, dict) else getattr(before, "abstract", None)
        old_status = before.get("status") if isinstance(before, dict) else getattr(before, "status", None)
        
        new_title = updated.get("title") if isinstance(updated, dict) else getattr(updated, "title", None)
        new_abstract = updated.get("abstract") if isinstance(updated, dict) else getattr(updated, "abstract", None)
        new_status = updated.get("status") if isinstance(updated, dict) else getattr(updated, "status", None)
        
        create_audit_log_sync(
            repo.db,
            action_type="UPDATE",
            resource_type="SUBMISSION",
            user_id=current_user.id,
            resource_id=submission_id,
            description="Updated submission",
            old_values={"title": old_title, "abstract": old_abstract, "status": old_status},
            new_values={"title": new_title, "abstract": new_abstract, "status": new_status},
            ip_address=req.client.host if req and req.client else None,
            user_agent=req.headers.get("user-agent") if req else None,
            metadata={"event": "submission_update", "pdf_uploaded": bool(file)},
        )
    except Exception:
        pass

    return updated


@router.delete("/{submission_id}")
def delete_submission(
    submission_id: int,
    req: Request,
    current_user=Depends(get_current_user),
    repo=Depends(get_submission_repo),
    valid_id: int = Depends(validate_submission_tenant)
):
    """Delete submission - only author or admin/chair can delete."""
    submission = GetSubmissionService(repo).execute(submission_id)
    DeleteSubmissionService(repo).execute(submission_id)

    try:
        submission_title = submission.get("title") if isinstance(submission, dict) else getattr(submission, "title", None)
        create_audit_log_sync(
            repo.db,
            action_type="DELETE",
            resource_type="SUBMISSION",
            user_id=current_user.id,
            resource_id=submission_id,
            description="Author withdrew a submission",
            old_values={"id": submission_id, "title": submission_title},
            ip_address=req.client.host if req and req.client else None,
            user_agent=req.headers.get("user-agent") if req else None,
            metadata={"event": "submission_withdraw"},
        )
    except Exception:
        pass
    return {"message": "Submission deleted successfully"}
