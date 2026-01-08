from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from api.schemas.track_schema import TrackCreateRequest, TrackUpdateRequest, TrackResponse
from infrastructure.databases.postgres import get_db
from infrastructure.repositorties.track_repo_impl import TrackRepositoryImpl
from infrastructure.models.conference_model import TrackModel
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin_or_chair
from domain.exceptions import NotFoundError

router = APIRouter(prefix="/tracks", tags=["Tracks"])


def get_track_repo(db: Session = Depends(get_db)):
    return TrackRepositoryImpl(db)


@router.post("", response_model=TrackResponse, status_code=status.HTTP_201_CREATED)
def create_track(
    request: TrackCreateRequest,
    current_user=Depends(require_admin_or_chair),
    repo=Depends(get_track_repo)
):
    """Create a new track - only admin or chair can create."""
    try:
        track = TrackModel(
            conference_id=request.conference_id,
            name=request.name,
            max_reviewers=request.max_reviewers
        )
        created = repo.create(track)
        return TrackResponse(
            id=created.id,
            conference_id=created.conference_id,
            name=created.name,
            max_reviewers=created.max_reviewers
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{track_id}", response_model=TrackResponse)
def get_track(
    track_id: int,
    current_user=Depends(get_current_user),
    repo=Depends(get_track_repo)
):
    """Get a track by ID."""
    try:
        track = repo.get_by_id(track_id)
        if not track:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")
        return TrackResponse(
            id=track.id,
            conference_id=track.conference_id,
            name=track.name,
            max_reviewers=track.max_reviewers
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/conferences/{conference_id}", response_model=List[TrackResponse])
def get_tracks_by_conference(
    conference_id: int,
    current_user=Depends(get_current_user),
    repo=Depends(get_track_repo)
):
    """Get all tracks for a conference."""
    try:
        tracks = repo.get_by_conference(conference_id)
        return [
            TrackResponse(
                id=t.id,
                conference_id=t.conference_id,
                name=t.name,
                max_reviewers=t.max_reviewers
            )
            for t in tracks
        ]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{track_id}", response_model=TrackResponse)
def update_track(
    track_id: int,
    request: TrackUpdateRequest,
    current_user=Depends(require_admin_or_chair),
    repo=Depends(get_track_repo)
):
    """Update a track - only admin or chair can update."""
    try:
        track = repo.get_by_id(track_id)
        if not track:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")
        
        if request.name is not None:
            track.name = request.name
        if request.max_reviewers is not None:
            track.max_reviewers = request.max_reviewers
        
        updated = repo.update(track)
        return TrackResponse(
            id=updated.id,
            conference_id=updated.conference_id,
            name=updated.name,
            max_reviewers=updated.max_reviewers
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_track(
    track_id: int,
    current_user=Depends(require_admin_or_chair),
    repo=Depends(get_track_repo)
):
    """Delete a track - only admin or chair can delete."""
    try:
        repo.delete(track_id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

