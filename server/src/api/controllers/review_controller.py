from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from api.schemas.review_schema import (
    ReviewAssignmentRequest, ReviewAssignmentResponse,
    ReviewSubmitRequest, ReviewResponse,
    COIDeclareRequest, COIResponse,
    BidRequest, BidResponse
)
from infrastructure.databases.postgres import get_db
from infrastructure.repositorties.review_repo_impl import ReviewRepositoryImpl
from infrastructure.repositorties.submission_repo_impl import SubmissionRepositoryImpl
from infrastructure.repositorties.user_repo_imlp import UserRepositoryImpl
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin_or_chair, require_chair_or_reviewer, require_reviewer
from services.review.assignment_service import AssignmentService
from services.review.review_service import ReviewService
from services.review.coi_service import COIService
from services.review.bidding_service import BiddingService
from domain.exceptions import NotFoundError, BusinessRuleException

router = APIRouter(prefix="/reviews", tags=["Reviews"])


def get_review_repo(db: Session = Depends(get_db)):
    return ReviewRepositoryImpl(db)


def get_submission_repo(db: Session = Depends(get_db)):
    return SubmissionRepositoryImpl(db)


async def get_user_repo(db: Session = Depends(get_db)):
    # Note: This is a workaround - user repo uses async but we need sync here
    # In production, you'd want to align these
    from infrastructure.databases.postgres import async_session
    async with async_session() as session:
        return UserRepositoryImpl(session)


def get_assignment_service(
    review_repo=Depends(get_review_repo),
    submission_repo=Depends(get_submission_repo),
    db=Depends(get_db)
):
    # For now, we'll use a simplified version without user_repo async dependency
    return AssignmentService(review_repo, submission_repo, None, db)


def get_review_service(
    review_repo=Depends(get_review_repo),
    submission_repo=Depends(get_submission_repo),
    db=Depends(get_db)
):
    return ReviewService(review_repo, submission_repo, db)


def get_coi_service(
    review_repo=Depends(get_review_repo),
    submission_repo=Depends(get_submission_repo),
    db=Depends(get_db)
):
    return COIService(review_repo, submission_repo, db)


def get_bidding_service(
    review_repo=Depends(get_review_repo),
    db=Depends(get_db)
):
    return BiddingService(review_repo, db)


@router.post("/assignments", response_model=ReviewAssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_reviewer(
    request: ReviewAssignmentRequest,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_assignment_service)
):
    """Assign a reviewer to a submission - only admin or chair can assign."""
    try:
        result = service.assign_reviewer(
            submission_id=request.submission_id,
            reviewer_id=request.reviewer_id,
            auto_assigned=request.auto_assigned
        )
        return ReviewAssignmentResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/assignments/{submission_id}/{reviewer_id}", status_code=status.HTTP_204_NO_CONTENT)
def unassign_reviewer(
    submission_id: int,
    reviewer_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_assignment_service)
):
    """Unassign a reviewer from a submission."""
    try:
        service.unassign_reviewer(submission_id, reviewer_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/assignments/submissions/{submission_id}", response_model=List[ReviewAssignmentResponse])
def get_assignments_by_submission(
    submission_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_assignment_service)
):
    """Get all assignments for a submission."""
    try:
        assignments = service.get_assignments_by_submission(submission_id)
        return [ReviewAssignmentResponse(**a) for a in assignments]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/assignments/reviewers/{reviewer_id}", response_model=List[ReviewAssignmentResponse])
def get_assignments_by_reviewer(
    reviewer_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_assignment_service)
):
    """Get all assignments for a reviewer."""
    try:
        assignments = service.get_assignments_by_reviewer(reviewer_id)
        return [ReviewAssignmentResponse(**a) for a in assignments]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/submit/{submission_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    submission_id: int,
    request: ReviewSubmitRequest,
    current_user=Depends(require_reviewer),
    service=Depends(get_review_service)
):
    """Submit a review - only reviewer can submit reviews."""
    try:
        review_data = request.dict(exclude_none=True)
        result = service.submit_review(
            submission_id=submission_id,
            reviewer_id=current_user.id,
            review_data=review_data
        )
        return ReviewResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/submissions/{submission_id}", response_model=List[ReviewResponse])
def get_reviews_by_submission(
    submission_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_review_service)
):
    """Get all reviews for a submission."""
    try:
        reviews = service.get_reviews_by_submission(submission_id)
        return [ReviewResponse(**r) for r in reviews]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/submissions/{submission_id}/reviewers/{reviewer_id}", response_model=ReviewResponse)
def get_review(
    submission_id: int,
    reviewer_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_review_service)
):
    """Get a specific review."""
    try:
        review = service.get_review(submission_id, reviewer_id)
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        return ReviewResponse(**review)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/coi", response_model=COIResponse, status_code=status.HTTP_201_CREATED)
def declare_coi(
    request: COIDeclareRequest,
    current_user=Depends(get_current_user),
    service=Depends(get_coi_service)
):
    """Declare a conflict of interest."""
    try:
        result = service.declare_coi(
            submission_id=request.submission_id,
            user_id=request.user_id,
            coi_type=request.coi_type
        )
        return COIResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/coi/submissions/{submission_id}", response_model=List[COIResponse])
def get_cois_by_submission(
    submission_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_coi_service)
):
    """Get all COIs for a submission."""
    try:
        cois = service.get_cois_by_submission(submission_id)
        return [COIResponse(**c) for c in cois]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/bids", response_model=BidResponse, status_code=status.HTTP_201_CREATED)
def place_bid(
    request: BidRequest,
    current_user=Depends(get_current_user),
    service=Depends(get_bidding_service)
):
    """Place a bid on a submission."""
    try:
        result = service.place_bid(
            submission_id=request.submission_id,
            reviewer_id=request.reviewer_id,
            bid=request.bid
        )
        return BidResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/bids/reviewers/{reviewer_id}", response_model=List[BidResponse])
def get_bids_by_reviewer(
    reviewer_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_bidding_service)
):
    """Get all bids by a reviewer."""
    try:
        bids = service.get_bids_by_reviewer(reviewer_id)
        return [BidResponse(**b) for b in bids]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

