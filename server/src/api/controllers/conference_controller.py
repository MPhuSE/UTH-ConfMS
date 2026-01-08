from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from api.schemas.conference_schema import ConferenceCreateRequest, ConferenceResponse, ConferenceListResponse  # pyright: ignore[reportMissingImports]
from domain.models.conference import Conference
from domain.exceptions import BusinessRuleException, NotFoundError
from infrastructure.databases.postgres import get_db
from infrastructure.repositorties.conference_repo_impl import ConferenceRepositoryImpl  # pyright: ignore[reportMissingImports]
from services.conference.create_conference import CreateConferenceService
from services.conference.get_conference import GetConferenceService
from services.conference.delete_conference import DeleteConferenceService
from services.conference.update_conference import UpdateConferenceService

router = APIRouter(prefix="/conferences", tags=["Conferences"])

@router.post("", response_model=dict)
def create_conference(
    request: ConferenceCreateRequest,
    db: Session = Depends(get_db)
):
    try:
        repo = ConferenceRepositoryImpl(db)
        service = CreateConferenceService(repo)

        conference = Conference(
            id=None,
            name=request.name,
            abbreviation=request.abbreviation,
            description=request.description,
            website_url=request.website_url,
            start_date=request.start_date,
            end_date=request.end_date,
            submission_deadline=request.submission_deadline,
            review_deadline=request.review_deadline,
            is_open=request.is_open,
            double_blind=request.double_blind
        )

        result = service.execute(conference)

        return {
            "message": "Conference created successfully",
            "data": result
        }
    except BusinessRuleException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e) 
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating conference: {str(e)}"
        )

@router.get("/{conference_id}", response_model=ConferenceResponse)
def get_conference_by_id(
    conference_id: int,
    db: Session = Depends(get_db)
):
    """Get a conference by ID."""
    try:
        repo = ConferenceRepositoryImpl(db)
        service = GetConferenceService(repo)
        
        conference = service.get_by_id(conference_id)
        
        return ConferenceResponse(
            id=conference.id,
            name=conference.name,
            abbreviation=conference.abbreviation,
            description=conference.description,
            website_url=conference.website_url,
            start_date=conference.start_date,
            end_date=conference.end_date,
            submission_deadline=conference.submission_deadline,
            review_deadline=conference.review_deadline,
            is_open=conference.is_open,
            double_blind=conference.double_blind
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting conference: {str(e)}"
        )

@router.get("", response_model=ConferenceListResponse)
def get_all_conferences(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """Get all conferences with pagination."""
    try:
        repo = ConferenceRepositoryImpl(db)
        service = GetConferenceService(repo)
        
        conferences = service.get_all(skip=skip, limit=limit)
        total = service.count_all()
        
        conference_responses = [
            ConferenceResponse(
                id=conf.id,
                name=conf.name,
                abbreviation=conf.abbreviation,
                description=conf.description,
                website_url=conf.website_url,
                start_date=conf.start_date,
                end_date=conf.end_date,
                submission_deadline=conf.submission_deadline,
                review_deadline=conf.review_deadline,
                is_open=conf.is_open,
                double_blind=conf.double_blind
            )
            for conf in conferences
        ]
        
        return ConferenceListResponse(
            conferences=conference_responses,
            total=total
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting conferences: {str(e)}"
        )


@router.delete("/{conference_id}", response_model=dict)
def delete_conference_by_id(
    conference_id: int,
    db: Session = Depends(get_db)
):
    """Delete a conference by ID."""
    try:
        repo = ConferenceRepositoryImpl(db)
        service = DeleteConferenceService(repo)

        service.delete(conference_id)

        return {
            "message": "Conference deleted successfully",
            "id": conference_id
        }
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting conference: {str(e)}"
        )


@router.put("/{conference_id}", response_model=ConferenceResponse)
def update_conference_by_id(
    conference_id: int,
    request: ConferenceCreateRequest,
    db: Session = Depends(get_db)
):
    """Update a conference by ID."""
    try:
        repo = ConferenceRepositoryImpl(db)
        service = UpdateConferenceService(repo)

        conference = Conference(
            id=conference_id,
            name=request.name,
            abbreviation=request.abbreviation,
            description=request.description,
            website_url=request.website_url,
            start_date=request.start_date,
            end_date=request.end_date,
            submission_deadline=request.submission_deadline,
            review_deadline=request.review_deadline,
            is_open=request.is_open,
            double_blind=request.double_blind
        )

        updated = service.update(conference)

        return ConferenceResponse(
            id=updated.id,
            name=updated.name,
            abbreviation=updated.abbreviation,
            description=updated.description,
            website_url=updated.website_url,
            start_date=updated.start_date,
            end_date=updated.end_date,
            submission_deadline=updated.submission_deadline,
            review_deadline=updated.review_deadline,
            is_open=updated.is_open,
            double_blind=updated.double_blind
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating conference: {str(e)}"
        )
