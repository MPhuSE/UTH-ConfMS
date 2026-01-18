from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from api.schemas.review_schema import (
    ReviewAssignmentRequest, ReviewAssignmentResponse,
    ReviewSubmitRequest, ReviewResponse,
    COIDeclareRequest, COIResponse,
    BidRequest, BidResponse
)
from infrastructure.databases.postgres import get_db
from infrastructure.repositories.review_repo_impl import ReviewRepositoryImpl
from infrastructure.repositories.submission_repo_impl import SubmissionRepositoryImpl
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin_or_chair, require_chair_or_reviewer, require_reviewer
from services.review.assignment_service import AssignmentService
from services.review.review_service import ReviewService
from services.review.coi_service import COIService
from services.review.bidding_service import BiddingService
from domain.exceptions import NotFoundError, BusinessRuleException
from api.utils.audit_utils import create_audit_log_sync

router = APIRouter(prefix="/reviews", tags=["Reviews"])


def get_review_repo(db: Session = Depends(get_db)):
    return ReviewRepositoryImpl(db)


def get_submission_repo(db: Session = Depends(get_db)):
    return SubmissionRepositoryImpl(db)


def get_assignment_service(
    review_repo=Depends(get_review_repo),
    submission_repo=Depends(get_submission_repo),
    db=Depends(get_db)
):
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


# ==================== ASSIGNMENT ENDPOINTS ====================

@router.post("/assignments", response_model=ReviewAssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_reviewer(
    request: ReviewAssignmentRequest,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_assignment_service)
):
    """
    Assign a reviewer to a submission - only admin or chair can assign.
    Automatically checks for COI before assignment.
    """
    try:
        result = service.assign_reviewer(
            submission_id=request.submission_id,
            reviewer_id=request.reviewer_id,
            auto_assigned=request.auto_assigned,
            check_coi=True
        )
        
        # Audit logging
        try:
            create_audit_log_sync(
                service.db,
                action_type="ASSIGN",
                resource_type="REVIEW",
                user_id=current_user.id,
                resource_id=request.submission_id,
                description=f"Assigned reviewer {request.reviewer_id} to submission {request.submission_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={
                    "reviewer_id": request.reviewer_id,
                    "auto_assigned": request.auto_assigned
                },
            )
        except Exception:
            pass
        
        return ReviewAssignmentResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/assignments/auto")
def auto_assign_reviewers(
    conference_id: int,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db),
    review_repo=Depends(get_review_repo),
    submission_repo=Depends(get_submission_repo),
    reviewers_per_paper: int = 3,
):
    """
    Auto-assign reviewers for a conference.
    Algorithm:
    1. Get all submissions for the conference
    2. Get all reviewers
    3. For each submission, assign reviewers with smallest load
    4. Skip if COI exists or already assigned
    """
    from infrastructure.models.submission_model import SubmissionModel
    from infrastructure.models.conference_model import TrackModel
    from infrastructure.models.user_model import UserModel, RoleModel, UserRoleModel

    # Get track ids for this conference
    track_ids = [t.id for t in db.query(TrackModel).filter(TrackModel.conference_id == conference_id).all()]
    if not track_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Conference {conference_id} has no tracks")
    
    submissions = db.query(SubmissionModel).filter(SubmissionModel.track_id.in_(track_ids)).all()
    if not submissions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No submissions found for conference {conference_id}")

    # Reviewer pool (users having global "reviewer" role)
    reviewer_users = (
        db.query(UserModel)
        .join(UserRoleModel, UserRoleModel.user_id == UserModel.id)
        .join(RoleModel, RoleModel.id == UserRoleModel.role_id)
        .filter(RoleModel.name == "reviewer")
        .filter(UserModel.is_active == True)
        .all()
    )
    reviewer_ids = [u.id for u in reviewer_users]
    
    if not reviewer_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active reviewers found")

    # Current load: number of assignments per reviewer in this conference
    from infrastructure.models.review_model import ReviewAssignmentModel
    submission_ids = [s.id for s in submissions]
    assignments = db.query(ReviewAssignmentModel).filter(ReviewAssignmentModel.submission_id.in_(submission_ids)).all()
    load = {rid: 0 for rid in reviewer_ids}
    for a in assignments:
        if a.reviewer_id in load:
            load[a.reviewer_id] += 1

    created = 0
    skipped = 0
    details = []

    for sub in submissions:
        existing_reviewer_ids = {a.reviewer_id for a in assignments if a.submission_id == sub.id}
        needed = max(0, reviewers_per_paper - len(existing_reviewer_ids))
        if needed == 0:
            continue

        # Pick least-loaded reviewers, skip COI and existing assignments
        candidates = sorted(reviewer_ids, key=lambda rid: load.get(rid, 0))
        for rid in candidates:
            if needed == 0:
                break
            if rid in existing_reviewer_ids:
                continue
            # Check COI
            if review_repo.check_coi(sub.id, rid):
                skipped += 1
                continue
            try:
                review_repo.create_assignment(sub.id, rid, auto_assigned=True)
                created += 1
                needed -= 1
                load[rid] = load.get(rid, 0) + 1
                details.append({"submission_id": sub.id, "reviewer_id": rid})
            except Exception:
                skipped += 1

    # Audit logging
    try:
        create_audit_log_sync(
            db,
            action_type="ASSIGN",
            resource_type="REVIEW",
            user_id=current_user.id,
            resource_id=conference_id,
            description=f"Auto-assigned reviewers for conference {conference_id}",
            ip_address=req.client.host if req and req.client else None,
            user_agent=req.headers.get("user-agent") if req else None,
            metadata={
                "conference_id": conference_id,
                "created": created,
                "skipped": skipped,
                "reviewers_per_paper": reviewers_per_paper
            },
        )
    except Exception:
        pass

    return {"created": created, "skipped": skipped, "assignments": details}


@router.delete("/assignments/{submission_id}/{reviewer_id}", status_code=status.HTTP_204_NO_CONTENT)
def unassign_reviewer(
    submission_id: int,
    reviewer_id: int,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_assignment_service)
):
    """Unassign a reviewer from a submission - only admin or chair can unassign."""
    try:
        service.unassign_reviewer(submission_id, reviewer_id)
        
        # Audit logging
        try:
            create_audit_log_sync(
                service.db,
                action_type="UNASSIGN",
                resource_type="REVIEW",
                user_id=current_user.id,
                resource_id=submission_id,
                description=f"Unassigned reviewer {reviewer_id} from submission {submission_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"reviewer_id": reviewer_id},
            )
        except Exception:
            pass
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/assignments/submissions/{submission_id}", response_model=List[ReviewAssignmentResponse])
def get_assignments_by_submission(
    submission_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_assignment_service)
):
    """Get all assignments for a submission - accessible by admin, chair, and assigned reviewers."""
    try:
        # Check if user is admin/chair or assigned reviewer
        assignments = service.get_assignments_by_submission(submission_id)
        user_roles = current_user.role_names
        
        # If not admin/chair, only show their own assignment
        if "admin" not in user_roles and "chair" not in user_roles:
            assignments = [a for a in assignments if a.get("reviewer_id") == current_user.id]
        
        return [ReviewAssignmentResponse(**a) for a in assignments]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/assignments/reviewers/{reviewer_id}", response_model=List[ReviewAssignmentResponse])
def get_assignments_by_reviewer(
    reviewer_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_assignment_service)
):
    """Get all assignments for a reviewer - reviewers can only see their own assignments."""
    user_roles = current_user.role_names
    
    # Reviewers can only see their own assignments
    if "admin" not in user_roles and "chair" not in user_roles:
        if reviewer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own assignments"
            )
    
    try:
        assignments = service.get_assignments_by_reviewer(reviewer_id)
        return [ReviewAssignmentResponse(**a) for a in assignments]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/assignments/my-assignments", response_model=List[ReviewAssignmentResponse])
def get_my_assignments(
    current_user=Depends(require_reviewer),
    service=Depends(get_assignment_service)
):
    """Get all assignments for the current reviewer."""
    try:
        assignments = service.get_assignments_by_reviewer(current_user.id)
        return [ReviewAssignmentResponse(**a) for a in assignments]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ==================== REVIEW ENDPOINTS ====================

@router.post("/submit/{submission_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    submission_id: int,
    request: ReviewSubmitRequest,
    req: Request,
    current_user=Depends(require_reviewer),
    service=Depends(get_review_service)
):
    """
    Submit a review - only reviewer can submit reviews.
    Reviewer must be assigned to the submission.
    """
    try:
        review_data = request.dict(exclude_none=True)
        result = service.submit_review(
            submission_id=submission_id,
            reviewer_id=current_user.id,
            review_data=review_data
        )
        
        # Audit logging
        try:
            create_audit_log_sync(
                service.db,
                action_type="SUBMIT",
                resource_type="REVIEW",
                user_id=current_user.id,
                resource_id=submission_id,
                description=f"Submitted review for submission {submission_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"review_id": result.get("id")},
            )
        except Exception:
            pass
        
        return ReviewResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/submissions/{submission_id}", response_model=List[ReviewResponse])
def get_reviews_by_submission(
    submission_id: int,
    req: Request,
    current_user=Depends(get_current_user),
    service=Depends(get_review_service)
):
    """
    Get all reviews for a submission.
    - Admin/Chair: See all reviews
    - Author: See anonymized reviews (reviewer_id hidden)
    - Reviewer: See only their own review
    """
    try:
        reviews = service.get_reviews_by_submission(submission_id)
        user_roles = current_user.role_names
        
        # If reviewer, only show their own review
        if "reviewer" in user_roles and "admin" not in user_roles and "chair" not in user_roles:
            reviews = [r for r in reviews if r.get("reviewer_id") == current_user.id]
        
        # Audit: VIEW reviews
        try:
            create_audit_log_sync(
                service.db,
                action_type="VIEW",
                resource_type="REVIEW",
                user_id=current_user.id,
                resource_id=submission_id,
                description="Viewed reviews for a submission",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"event": "reviews_view"},
            )
        except Exception:
            pass
        
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
    """
    Get a specific review.
    Reviewers can only see their own reviews.
    """
    user_roles = current_user.role_names
    
    # Reviewers can only see their own reviews
    if "reviewer" in user_roles and "admin" not in user_roles and "chair" not in user_roles:
        if reviewer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own reviews"
            )
    
    try:
        review = service.get_review(submission_id, reviewer_id)
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        return ReviewResponse(**review)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/my-reviews", response_model=List[ReviewResponse])
def get_my_reviews(
    db: Session = Depends(get_db),
    review_repo=Depends(get_review_repo),
    submission_repo=Depends(get_submission_repo),
    current_user=Depends(require_reviewer)
):
    """Get all reviews submitted by the current reviewer."""
    try:
        # Get all assignments for this reviewer
        assignment_service = AssignmentService(review_repo, submission_repo, None, db)
        assignments = assignment_service.get_assignments_by_reviewer(current_user.id)
        
        # Get reviews for each assignment
        review_service = ReviewService(review_repo, submission_repo, db)
        reviews = []
        for assignment in assignments:
            review = review_service.get_review(assignment["submission_id"], current_user.id)
            if review:
                reviews.append(review)
        
        return [ReviewResponse(**r) for r in reviews]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ==================== COI ENDPOINTS ====================

@router.post("/coi", response_model=COIResponse, status_code=status.HTTP_201_CREATED)
def declare_coi(
    request: COIDeclareRequest,
    req: Request,
    current_user=Depends(get_current_user),
    service=Depends(get_coi_service)
):
    """
    Declare a conflict of interest.
    - Reviewers can declare COI for themselves
    - Admin/Chair can declare COI for any user
    """
    user_roles = current_user.role_names
    
    # Reviewers can only declare COI for themselves
    if "reviewer" in user_roles and "admin" not in user_roles and "chair" not in user_roles:
        if request.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only declare COI for yourself"
            )
    
    try:
        result = service.declare_coi(
            submission_id=request.submission_id,
            user_id=request.user_id,
            coi_type=request.coi_type
        )
        
        # Audit logging
        try:
            create_audit_log_sync(
                service.db,
                action_type="DECLARE",
                resource_type="COI",
                user_id=current_user.id,
                resource_id=request.submission_id,
                description=f"Declared COI for user {request.user_id} on submission {request.submission_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={
                    "user_id": request.user_id,
                    "coi_type": request.coi_type
                },
            )
        except Exception:
            pass
        
        return COIResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessRuleException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/coi/submissions/{submission_id}", response_model=List[COIResponse])
def get_cois_by_submission(
    submission_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_coi_service)
):
    """Get all COIs for a submission - accessible by admin and chair."""
    user_roles = current_user.role_names
    if "admin" not in user_roles and "chair" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin and chair can view COIs"
        )
    
    try:
        cois = service.get_cois_by_submission(submission_id)
        return [COIResponse(**c) for c in cois]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/coi/my-cois", response_model=List[COIResponse])
def get_my_cois(
    current_user=Depends(require_reviewer),
    service=Depends(get_coi_service)
):
    """Get all COIs declared by the current reviewer."""
    try:
        cois = service.get_cois_by_user(current_user.id)
        return [COIResponse(**c) for c in cois]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/coi/check/{submission_id}")
def check_coi(
    submission_id: int,
    current_user=Depends(require_reviewer),
    service=Depends(get_coi_service)
):
    """Check if the current reviewer has a COI with a submission."""
    try:
        has_coi = service.check_coi(submission_id, current_user.id)
        return {"submission_id": submission_id, "has_coi": has_coi}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ==================== BIDDING ENDPOINTS ====================

@router.post("/bids", response_model=BidResponse, status_code=status.HTTP_201_CREATED)
def place_bid(
    request: BidRequest,
    req: Request,
    current_user=Depends(require_reviewer),
    service=Depends(get_bidding_service)
):
    """
    Place a bid on a submission.
    Reviewers can only bid for themselves.
    """
    # Reviewers can only bid for themselves
    if request.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only place bids for yourself"
        )
    
    try:
        result = service.place_bid(
            submission_id=request.submission_id,
            reviewer_id=current_user.id,
            bid=request.bid
        )
        
        # Audit logging
        try:
            create_audit_log_sync(
                service.db,
                action_type="BID",
                resource_type="REVIEW",
                user_id=current_user.id,
                resource_id=request.submission_id,
                description=f"Placed bid '{request.bid}' on submission {request.submission_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                metadata={"bid": request.bid},
            )
        except Exception:
            pass
        
        return BidResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/bids/reviewers/{reviewer_id}", response_model=List[BidResponse])
def get_bids_by_reviewer(
    reviewer_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_bidding_service)
):
    """Get all bids by a reviewer - reviewers can only see their own bids."""
    user_roles = current_user.role_names
    
    # Reviewers can only see their own bids
    if "reviewer" in user_roles and "admin" not in user_roles and "chair" not in user_roles:
        if reviewer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own bids"
            )
    
    try:
        bids = service.get_bids_by_reviewer(reviewer_id)
        return [BidResponse(**b) for b in bids]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/bids/my-bids", response_model=List[BidResponse])
def get_my_bids(
    current_user=Depends(require_reviewer),
    service=Depends(get_bidding_service)
):
    """Get all bids placed by the current reviewer."""
    try:
        bids = service.get_bids_by_reviewer(current_user.id)
        return [BidResponse(**b) for b in bids]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ==================== PROGRESS TRACKING ====================

@router.get("/progress/conferences/{conference_id}")
def get_review_progress_by_conference(
    conference_id: int,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db),
):
    """
    Progress tracking for chairs:
    - total assignments / completed reviews / pending reviews
    - per reviewer completion counts
    """
    from infrastructure.models.conference_model import TrackModel
    from infrastructure.models.submission_model import SubmissionModel
    from infrastructure.models.review_model import ReviewAssignmentModel, ReviewModel

    track_ids = [t.id for t in db.query(TrackModel).filter(TrackModel.conference_id == conference_id).all()]
    if not track_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Conference {conference_id} has no tracks")
    
    submissions = db.query(SubmissionModel).filter(SubmissionModel.track_id.in_(track_ids)).all()
    submission_ids = [s.id for s in submissions]

    assignments = db.query(ReviewAssignmentModel).filter(ReviewAssignmentModel.submission_id.in_(submission_ids)).all()
    reviews = db.query(ReviewModel).filter(ReviewModel.submission_id.in_(submission_ids)).all()

    total_assignments = len(assignments)
    completed_reviews = len(reviews)
    pending = total_assignments - completed_reviews

    # Per reviewer
    per_reviewer = {}
    for a in assignments:
        per_reviewer.setdefault(a.reviewer_id, {"assignments": 0, "completed": 0})
        per_reviewer[a.reviewer_id]["assignments"] += 1
    for r in reviews:
        per_reviewer.setdefault(r.reviewer_id, {"assignments": 0, "completed": 0})
        per_reviewer[r.reviewer_id]["completed"] += 1

    reviewer_progress = [
        {"reviewer_id": rid, **vals, "pending": vals["assignments"] - vals["completed"]}
        for rid, vals in per_reviewer.items()
    ]

    reviewer_progress.sort(key=lambda x: (x["pending"], -x["completed"]))

    return {
        "conference_id": conference_id,
        "total_submissions": len(submissions),
        "total_assignments": total_assignments,
        "completed_reviews": completed_reviews,
        "pending_reviews": pending,
        "completion_rate": round((completed_reviews / total_assignments * 100), 2) if total_assignments else 0.0,
        "reviewers": reviewer_progress,
    }
