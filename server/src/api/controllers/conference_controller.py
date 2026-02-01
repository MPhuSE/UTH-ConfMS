from fastapi import APIRouter, Depends, HTTPException, status, Query
from starlette.requests import Request
from sqlalchemy.orm import Session
from typing import List, Optional

from api.schemas.conference_schema import (
    ConferenceCreateRequest, 
    ConferenceResponse, 
    ConferenceListResponse,
    UpdateCFPRequest,     
    PublicCFPResponse    
)
from domain.models.conference import Conference
from domain.exceptions import BusinessRuleException, NotFoundError
from infrastructure.databases.postgres import get_db
from infrastructure.repositories.conference_repo_impl import ConferenceRepositoryImpl 
from infrastructure.security.tenant_dependency import get_current_tenant
from infrastructure.models.tenant_model import TenantModel
from infrastructure.security.rbac import require_admin_or_chair
from api.utils.audit_utils import create_audit_log_sync

from services.conference.create_conference import CreateConferenceService
from services.conference.get_conference import GetConferenceService
from services.conference.delete_conference import DeleteConferenceService
from services.conference.update_conference import UpdateConferenceService

from services.conference.cfp_service import CFPService
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from infrastructure.models.conference_model import ConferenceModel

router = APIRouter(prefix="/conferences", tags=["Conferences"])

@router.post("", response_model=ConferenceResponse, status_code=status.HTTP_201_CREATED)
def create_conference(
    request: ConferenceCreateRequest,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db),
    tenant: Optional[TenantModel] = Depends(get_current_tenant)
):
    try:
        # Log request để debug
        print(f"[CONFERENCE DEBUG] ===== START CREATE CONFERENCE =====")
        print(f"[CONFERENCE DEBUG] Conference name: {request.name}")
        print(f"[CONFERENCE DEBUG] Request object type: {type(request)}")
        
        # Ưu tiên tenant_id từ request (dành cho Admin), nếu không có thì lấy từ context header
        tenant_id = request.tenant_id if request.tenant_id else (tenant.id if tenant else None)
        
        repo = ConferenceRepositoryImpl(db)
        service = CreateConferenceService(repo)
        
        # Mapping request schema sang domain model
        conference = Conference(
            id=None,
            name=request.name,
            abbreviation=request.abbreviation,
            description=request.description,
            website=request.website,
            location=request.location,
            start_date=request.start_date,
            end_date=request.end_date,
            submission_deadline=request.submission_deadline,
            review_deadline=request.review_deadline,
            is_open=request.is_open,
            blind_mode=request.blind_mode or 'double',
            tenant_id=tenant_id,
            rebuttal_open=request.rebuttal_open,
            rebuttal_deadline=request.rebuttal_deadline,
            camera_ready_open=request.camera_ready_open,
            camera_ready_deadline=request.camera_ready_deadline
        )
        
        result = service.execute(conference)
        print(f"[CONFERENCE DEBUG] Conference created with ID: {result.id}")
        
        # Tạo tracks nếu có trong request - sử dụng track_repo giống như track_controller
        created_tracks = []
        track_errors = []
        if request.tracks and len(request.tracks) > 0:
            try:
                from infrastructure.models.conference_model import TrackModel
                from infrastructure.repositories.track_repo_impl import TrackRepositoryImpl
                
                track_repo = TrackRepositoryImpl(db)
                
                print(f"[TRACK DEBUG] ===== START CREATING TRACKS =====")
                print(f"[TRACK DEBUG] Conference ID: {result.id}")
                print(f"[TRACK DEBUG] Number of tracks to create: {len(request.tracks)}")
                print(f"[TRACK DEBUG] Tracks data: {[(t.name, t.max_reviewers) for t in request.tracks]}")
                
                # Tạo từng track sử dụng track_repo.create() (giống như track_controller)
                for idx, track_data in enumerate(request.tracks):
                    try:
                        if not track_data.name or not track_data.name.strip():
                            print(f"[TRACK DEBUG] Skipping track #{idx+1}: empty name")
                            track_errors.append(f"Track #{idx+1}: Tên không được để trống")
                            continue
                        
                        print(f"[TRACK DEBUG] Creating track #{idx+1}: name='{track_data.name}', max_reviewers={track_data.max_reviewers}")
                        
                        track = TrackModel(
                            conference_id=result.id,
                            name=track_data.name.strip(),
                            max_reviewers=track_data.max_reviewers if track_data.max_reviewers and track_data.max_reviewers > 0 else 3
                        )
                        
                        # Sử dụng track_repo.create() - method này tự commit
                        created_track = track_repo.create(track)
                        print(f"[TRACK DEBUG] Track #{idx+1} created successfully: ID={created_track.id}, Name={created_track.name}, Conference_ID={created_track.conference_id}")
                        
                        created_tracks.append({
                            "id": created_track.id,
                            "name": created_track.name,
                            "max_reviewers": created_track.max_reviewers
                        })
                        
                        # Audit log (non-critical)
                        try:
                            create_audit_log_sync(
                                db,
                                action_type="CREATE",
                                resource_type="TRACK",
                                user_id=current_user.id,
                                resource_id=created_track.id,
                                description=f"Created track: {track_data.name} for conference {result.id}",
                                ip_address=req.client.host if req and req.client else None,
                                user_agent=req.headers.get("user-agent") if req else None,
                                new_values={
                                    "name": track_data.name,
                                    "conference_id": result.id,
                                    "max_reviewers": track_data.max_reviewers,
                                },
                            )
                        except Exception as audit_error:
                            print(f"[TRACK DEBUG] Audit log error (non-critical): {str(audit_error)}")
                        
                    except Exception as single_track_error:
                        print(f"[TRACK DEBUG] ERROR creating track #{idx+1}: {str(single_track_error)}")
                        import traceback
                        traceback.print_exc()
                        track_errors.append(f"Track '{track_data.name if track_data.name else f'#{idx+1}'}': {str(single_track_error)}")
                        # Không rollback vì track_repo.create() đã commit riêng
                
                # Verify tracks were saved by querying database
                saved_tracks = db.query(TrackModel).filter(TrackModel.conference_id == result.id).all()
                print(f"[TRACK DEBUG] Verification: Found {len(saved_tracks)} tracks in database for conference {result.id}")
                for saved_track in saved_tracks:
                    print(f"[TRACK DEBUG] Verified track in DB: ID={saved_track.id}, Name={saved_track.name}")
                
                print(f"[TRACK DEBUG] ===== SUCCESS: Created {len(created_tracks)} tracks =====")
                
                if track_errors:
                    print(f"[TRACK DEBUG] Track errors: {track_errors}")
                    
            except Exception as track_error:
                # Log error but don't fail the conference creation
                print(f"[TRACK DEBUG] ===== FATAL ERROR CREATING TRACKS =====")
                print(f"[TRACK DEBUG] Error: {str(track_error)}")
                import traceback
                traceback.print_exc()
                track_errors.append(f"Lỗi hệ thống: {str(track_error)}")
        
        try:
            create_audit_log_sync(
                db,
                action_type="CREATE",
                resource_type="CONFERENCE",
                user_id=current_user.id,
                resource_id=result.id,
                description=f"Created conference: {request.name}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                new_values={
                    "name": request.name,
                    "abbreviation": request.abbreviation,
                    "is_open": request.is_open,
                    "blind_mode": request.blind_mode,
                    "tracks_count": len(created_tracks),
                },
            )
        except Exception:
            pass
        
        # Final verification: Query tracks from database one more time
        # Luôn query lại để đảm bảo tracks đã được lưu
        from infrastructure.models.conference_model import TrackModel
        final_tracks = db.query(TrackModel).filter(TrackModel.conference_id == result.id).all()
        print(f"[CONFERENCE DEBUG] Final verification: {len(final_tracks)} tracks in database for conference {result.id}")
        
        # Update created_tracks với data thực tế từ DB (đảm bảo luôn có data chính xác)
        if final_tracks:
            created_tracks = [{"id": t.id, "name": t.name, "max_reviewers": t.max_reviewers} for t in final_tracks]
            print(f"[CONFERENCE DEBUG] Updated created_tracks from DB: {created_tracks}")
        elif request.tracks and len(request.tracks) > 0:
            print(f"[CONFERENCE DEBUG] WARNING: Expected {len(request.tracks)} tracks but found {len(final_tracks)} in DB!")
        
        # Đảm bảo created_tracks luôn là list (không phải None)
        if not isinstance(created_tracks, list):
            created_tracks = []
        
        return ConferenceResponse(
            id=result.id,
            name=result.name,
            abbreviation=result.abbreviation,
            description=result.description,
            website=result.website,
            location=result.location,
            start_date=result.start_date,
            end_date=result.end_date,
            submission_deadline=result.submission_deadline,
            review_deadline=result.review_deadline,
            is_open=result.is_open,
            blind_mode=result.blind_mode,
            tenant_id=result.tenant_id,
            rebuttal_open=result.rebuttal_open,
            rebuttal_deadline=result.rebuttal_deadline,
            camera_ready_open=result.camera_ready_open,
            camera_ready_deadline=result.camera_ready_deadline,
            tracks=created_tracks,
            track_warnings=track_errors,
            message="Conference created successfully"
        )
    except BusinessRuleException as e:
        print(f"[CONFERENCE DEBUG] BusinessRuleException: {str(e)}")
        # Don't rollback here - conference and tracks may have been committed
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(f"[CONFERENCE DEBUG] Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        # Only rollback if conference wasn't committed yet
        # Since conference is committed in service.execute(), tracks should be safe
        try:
            db.rollback()
        except:
            pass
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error creating: {str(e)}")

@router.get("/{conference_id}", response_model=ConferenceResponse)
def get_conference_by_id(conference_id: int, db: Session = Depends(get_db)):
    try:
        repo = ConferenceRepositoryImpl(db)
        service = GetConferenceService(repo)
        conf = service.get_by_id(conference_id)
        # Get full model to access workflow fields
        conf_model = db.query(ConferenceModel).filter(ConferenceModel.id == conference_id).first()
        if not conf_model:
            raise NotFoundError(f"Conference with id {conference_id} not found")
        
        return ConferenceResponse(
            id=conf.id, name=conf.name, abbreviation=conf.abbreviation,
            description=conf.description, website=conf.website,
            location=conf.location, start_date=conf.start_date, end_date=conf.end_date,
            submission_deadline=conf.submission_deadline,
            review_deadline=conf.review_deadline,
            is_open=conf.is_open, blind_mode=conf.blind_mode,
            tenant_id=conf.tenant_id,
            rebuttal_open=conf_model.rebuttal_open,
            rebuttal_deadline=conf_model.rebuttal_deadline,
            camera_ready_open=conf_model.camera_ready_open,
            camera_ready_deadline=conf_model.camera_ready_deadline
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("", response_model=ConferenceListResponse)
def get_all_conferences(
    skip: int = Query(0), 
    limit: int = Query(100), 
    db: Session = Depends(get_db),
    tenant: Optional[TenantModel] = Depends(get_current_tenant)
):
    tenant_id = tenant.id if tenant else None
    repo = ConferenceRepositoryImpl(db)
    service = GetConferenceService(repo)
    conferences = service.get_all(skip=skip, limit=limit, tenant_id=tenant_id)
    total = service.count_all(tenant_id=tenant_id)
    
    # Get full models to access workflow fields
    conf_ids = [c.id for c in conferences] if conferences else []
    conf_models = {}
    if conf_ids:
        conf_models = {cm.id: cm for cm in db.query(ConferenceModel).filter(ConferenceModel.id.in_(conf_ids)).all()}
    
    return ConferenceListResponse(
        conferences=[ConferenceResponse(
            id=c.id, name=c.name, abbreviation=c.abbreviation, description=c.description,
            website=c.website, location=c.location, start_date=c.start_date, end_date=c.end_date,
            submission_deadline=c.submission_deadline, review_deadline=c.review_deadline,
            is_open=c.is_open, blind_mode=c.blind_mode,
            tenant_id=c.tenant_id,
            rebuttal_open=conf_models[c.id].rebuttal_open if c.id in conf_models else False,
            rebuttal_deadline=conf_models[c.id].rebuttal_deadline if c.id in conf_models else None,
            camera_ready_open=conf_models[c.id].camera_ready_open if c.id in conf_models else False,
            camera_ready_deadline=conf_models[c.id].camera_ready_deadline if c.id in conf_models else None
        ) for c in conferences],
        total=total
    )

@router.delete("/{conference_id}", response_model=dict)
def delete_conference_by_id(
    conference_id: int,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db)
):
    try:
        repo = ConferenceRepositoryImpl(db)
        get_service = GetConferenceService(repo)
        conf_before = None
        try:
            conf_before = get_service.get_by_id(conference_id)
        except:
            pass
        
        service = DeleteConferenceService(repo)
        service.delete(conference_id)
        
        try:
            create_audit_log_sync(
                db,
                action_type="DELETE",
                resource_type="CONFERENCE",
                user_id=current_user.id,
                resource_id=conference_id,
                description=f"Deleted conference: {conf_before.name if conf_before else f'#{conference_id}'}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                old_values={
                    "name": conf_before.name if conf_before else None,
                    "id": conference_id,
                } if conf_before else None,
            )
        except Exception:
            pass
        
        return {"message": "Conference deleted successfully", "id": conference_id}
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{conference_id}", response_model=ConferenceResponse)
def update_conference_by_id(
    conference_id: int,
    request: ConferenceCreateRequest,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db)
):
    try:
        repo = ConferenceRepositoryImpl(db)
        get_service = GetConferenceService(repo)
        old_conf = None
        try:
            old_conf = get_service.get_by_id(conference_id)
        except:
            pass
        
        service = UpdateConferenceService(repo)
        conf = Conference(
            id=conference_id, name=request.name, abbreviation=request.abbreviation,
            description=request.description, website=request.website,
            location=request.location, start_date=request.start_date, end_date=request.end_date,
            submission_deadline=request.submission_deadline,
            review_deadline=request.review_deadline,
            is_open=request.is_open, blind_mode=request.blind_mode,
            rebuttal_open=request.rebuttal_open,
            rebuttal_deadline=request.rebuttal_deadline,
            camera_ready_open=request.camera_ready_open,
            camera_ready_deadline=request.camera_ready_deadline
        )
        updated = service.update(conf)
        
        try:
            create_audit_log_sync(
                db,
                action_type="UPDATE",
                resource_type="CONFERENCE",
                user_id=current_user.id,
                resource_id=conference_id,
                description=f"Updated conference: {request.name}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                old_values={
                    "name": old_conf.name if old_conf else None,
                    "is_open": old_conf.is_open if old_conf else None,
                    "blind_mode": old_conf.blind_mode if old_conf else None,
                } if old_conf else None,
                new_values={
                    "name": request.name,
                    "is_open": request.is_open,
                    "blind_mode": request.blind_mode,
                },
            )
        except Exception:
            pass
        
        return ConferenceResponse(
            id=updated.id, name=updated.name, abbreviation=updated.abbreviation,
            description=updated.description, website=updated.website,
            location=updated.location, start_date=updated.start_date, end_date=updated.end_date,
            submission_deadline=updated.submission_deadline,
            review_deadline=updated.review_deadline,
            is_open=updated.is_open, blind_mode=updated.blind_mode,
            rebuttal_open=updated.rebuttal_open,
            rebuttal_deadline=updated.rebuttal_deadline,
            camera_ready_open=updated.camera_ready_open,
            camera_ready_deadline=updated.camera_ready_deadline
        )
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{conference_id}/cfp", response_model=dict)
def update_cfp_content(
    conference_id: int,
    request: UpdateCFPRequest,
    req: Request,
    current_user=Depends(require_admin_or_chair), 
    db: Session = Depends(get_db)
):
    """Cập nhật nội dung CFP (CNPM-54)"""
    try:
        repo = ConferenceRepositoryImpl(db)
        service = CFPService(repo)
        service.update_cfp_content(conference_id, request.description, request.submission_deadline)
        
        try:
            create_audit_log_sync(
                db,
                action_type="UPDATE",
                resource_type="CFP",
                user_id=current_user.id,
                resource_id=conference_id,
                description=f"Updated CFP content for conference {conference_id}",
                ip_address=req.client.host if req and req.client else None,
                user_agent=req.headers.get("user-agent") if req else None,
                new_values={
                    "submission_deadline": request.submission_deadline.isoformat() if request.submission_deadline else None,
                },
            )
        except Exception:
            pass
        
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


class WorkflowSettingsUpdateRequest(BaseModel):
    rebuttal_open: Optional[bool] = None
    rebuttal_deadline: Optional[datetime] = None
    camera_ready_open: Optional[bool] = None
    camera_ready_deadline: Optional[datetime] = None


@router.patch("/{conference_id}/workflow", response_model=dict)
def update_workflow_settings(
    conference_id: int,
    request: WorkflowSettingsUpdateRequest,
    req: Request,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db),
):
    conf = db.query(ConferenceModel).filter(ConferenceModel.id == conference_id).first()
    if not conf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conference not found")

    # Store old values for audit
    old_values = {
        "rebuttal_open": conf.rebuttal_open,
        "rebuttal_deadline": conf.rebuttal_deadline.isoformat() if conf.rebuttal_deadline else None,
        "camera_ready_open": conf.camera_ready_open,
        "camera_ready_deadline": conf.camera_ready_deadline.isoformat() if conf.camera_ready_deadline else None,
    }

    if request.rebuttal_open is not None:
        conf.rebuttal_open = request.rebuttal_open
    if request.rebuttal_deadline is not None:
        conf.rebuttal_deadline = request.rebuttal_deadline
    if request.camera_ready_open is not None:
        conf.camera_ready_open = request.camera_ready_open
    if request.camera_ready_deadline is not None:
        conf.camera_ready_deadline = request.camera_ready_deadline

    db.add(conf)
    db.commit()
    db.refresh(conf)

    try:
        create_audit_log_sync(
            db,
            action_type="UPDATE",
            resource_type="WORKFLOW",
            user_id=current_user.id,
            resource_id=conference_id,
            description=f"Updated workflow settings for conference {conference_id}",
            ip_address=req.client.host if req and req.client else None,
            user_agent=req.headers.get("user-agent") if req else None,
            old_values=old_values,
            new_values={
                "rebuttal_open": conf.rebuttal_open,
                "rebuttal_deadline": conf.rebuttal_deadline.isoformat() if conf.rebuttal_deadline else None,
                "camera_ready_open": conf.camera_ready_open,
                "camera_ready_deadline": conf.camera_ready_deadline.isoformat() if conf.camera_ready_deadline else None,
            },
        )
    except Exception:
        pass

    return {
        "id": conf.id,
        "rebuttal_open": conf.rebuttal_open,
        "rebuttal_deadline": conf.rebuttal_deadline,
        "camera_ready_open": conf.camera_ready_open,
        "camera_ready_deadline": conf.camera_ready_deadline,
    }