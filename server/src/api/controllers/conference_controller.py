from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

# Import các schema (đảm bảo file schema của bạn đã dán code tôi gửi ở bước trước)
from api.schemas.conference_schema import (
    ConferenceCreateRequest, 
    ConferenceResponse, 
    ConferenceListResponse,
    UpdateCFPRequest,      # Mới thêm
    PublicCFPResponse     # Mới thêm
)
from domain.models.conference import Conference
from domain.exceptions import BusinessRuleException, NotFoundError
from infrastructure.databases.postgres import get_db
from infrastructure.repositories.conference_repo_impl import ConferenceRepositoryImpl 
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin_or_chair

# Import các services cũ
from services.conference.create_conference import CreateConferenceService
from services.conference.get_conference import GetConferenceService
from services.conference.delete_conference import DeleteConferenceService
from services.conference.update_conference import UpdateConferenceService

# Import service CFP mới
from services.conference.cfp_service import CFPService

router = APIRouter(prefix="/conferences", tags=["Conferences"])

# --- CÁC ENDPOINT CŨ CỦA BẠN (GIỮ NGUYÊN) ---

@router.post("", response_model=dict)
def create_conference(
    request: ConferenceCreateRequest,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db)
):
    try:
        repo = ConferenceRepositoryImpl(db)
        service = CreateConferenceService(repo)
        conference = Conference(
            id=None, name=request.name, abbreviation=request.abbreviation,
            description=request.description, website_url=request.website_url,
            start_date=request.start_date, end_date=request.end_date,
            submission_deadline=request.submission_deadline,
            review_deadline=request.review_deadline,
            is_open=request.is_open, double_blind=request.double_blind
        )
        result = service.execute(conference)
        return {"message": "Conference created successfully", "data": result}
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error creating: {str(e)}")

@router.get("/{conference_id}", response_model=ConferenceResponse)
def get_conference_by_id(conference_id: int, db: Session = Depends(get_db)):
    try:
        repo = ConferenceRepositoryImpl(db)
        service = GetConferenceService(repo)
        conf = service.get_by_id(conference_id)
        return ConferenceResponse(
            id=conf.id, name=conf.name, abbreviation=conf.abbreviation,
            description=conf.description, website_url=conf.website_url,
            start_date=conf.start_date, end_date=conf.end_date,
            submission_deadline=conf.submission_deadline,
            review_deadline=conf.review_deadline,
            is_open=conf.is_open, double_blind=conf.double_blind
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("", response_model=ConferenceListResponse)
def get_all_conferences(skip: int = Query(0), limit: int = Query(100), db: Session = Depends(get_db)):
    repo = ConferenceRepositoryImpl(db)
    service = GetConferenceService(repo)
    conferences = service.get_all(skip=skip, limit=limit)
    total = service.count_all()
    return ConferenceListResponse(
        conferences=[ConferenceResponse(
            id=c.id, name=c.name, abbreviation=c.abbreviation, description=c.description,
            website_url=c.website_url, start_date=c.start_date, end_date=c.end_date,
            submission_deadline=c.submission_deadline, review_deadline=c.review_deadline,
            is_open=c.is_open, double_blind=c.double_blind
        ) for c in conferences],
        total=total
    )

@router.delete("/{conference_id}", response_model=dict)
def delete_conference_by_id(conference_id: int, current_user=Depends(require_admin_or_chair), db: Session = Depends(get_db)):
    try:
        repo = ConferenceRepositoryImpl(db)
        service = DeleteConferenceService(repo)
        service.delete(conference_id)
        return {"message": "Conference deleted successfully", "id": conference_id}
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{conference_id}", response_model=ConferenceResponse)
def update_conference_by_id(conference_id: int, request: ConferenceCreateRequest, current_user=Depends(require_admin_or_chair), db: Session = Depends(get_db)):
    try:
        repo = ConferenceRepositoryImpl(db)
        service = UpdateConferenceService(repo)
        conf = Conference(
            id=conference_id, name=request.name, abbreviation=request.abbreviation,
            description=request.description, website_url=request.website_url,
            start_date=request.start_date, end_date=request.end_date,
            submission_deadline=request.submission_deadline,
            review_deadline=request.review_deadline,
            is_open=request.is_open, double_blind=request.double_blind
        )
        updated = service.update(conf)
        return ConferenceResponse(
            id=updated.id, name=updated.name, abbreviation=updated.abbreviation,
            description=updated.description, website_url=updated.website_url,
            start_date=updated.start_date, end_date=updated.end_date,
            submission_deadline=updated.submission_deadline,
            review_deadline=updated.review_deadline,
            is_open=updated.is_open, double_blind=updated.double_blind
        )
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


# --- CNPM-54 & CNPM-55: CÁC ENDPOINT CFP MỚI ---

@router.put("/{conference_id}/cfp", response_model=dict)
def update_cfp_content(
    conference_id: int,
    request: UpdateCFPRequest,
    current_user=Depends(require_admin_or_chair), # Chỉ Admin/Chair mới được sửa
    db: Session = Depends(get_db)
):
    """Cập nhật nội dung CFP (CNPM-54)"""
    try:
        repo = ConferenceRepositoryImpl(db)
        service = CFPService(repo)
        service.update_cfp_content(conference_id, request.description, request.submission_deadline)
        return {"message": "CFP content updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{conference_id}/cfp/public", response_model=PublicCFPResponse)
def get_public_cfp(
    conference_id: int,
    db: Session = Depends(get_db)
):
    """Lấy thông tin CFP công khai (CNPM-55)"""
    try:
        repo = ConferenceRepositoryImpl(db)
        service = CFPService(repo)
        result = service.get_public_cfp(conference_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))