import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from infrastructure.databases.postgres import get_db
from infrastructure.models.pc_model import PCInvitationModel, ConferencePCMemberModel
from infrastructure.models.user_model import UserModel, RoleModel
from infrastructure.security.rbac import require_admin_or_chair
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.email.email_service import EmailService
from api.schemas.pc_schema import (
    PCInviteRequest,
    PCInvitationResponse,
    PCInvitationListResponse,
    PCAcceptRequest,
    PCMemberResponse,
    PCMemberListResponse,
)

router = APIRouter(prefix="/pc", tags=["PC & Assignments"])


def _now_utc():
    return datetime.now(timezone.utc)


@router.post("/invitations", response_model=PCInvitationResponse, status_code=status.HTTP_201_CREATED)
async def invite_pc_member(
    request: PCInviteRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_chair),
):
    token = secrets.token_urlsafe(24)
    expires_at = request.expires_at or (_now_utc() + timedelta(days=7))

    invitation = PCInvitationModel(
        conference_id=request.conference_id,
        email=str(request.email).lower(),
        role=(request.role or "reviewer").lower(),
        token=token,
        status="PENDING",
        expires_at=expires_at,
        invited_by=current_user.id,
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    # Send invitation email (best-effort)
    try:
        email_service = EmailService()
        accept_url = f"{email_service.frontend_url}/dashboard/pc/accept?token={token}"
        content = request.message or (
            f"<p>Bạn được mời tham gia Program Committee cho conference #{request.conference_id}.</p>"
            f"<p>Vai trò: <b>{invitation.role}</b></p>"
            f"<p>Click để chấp nhận lời mời: <a href='{accept_url}'>{accept_url}</a></p>"
        )
        await email_service.send_notification(
            to_email=invitation.email,
            title="PC Invitation",
            content=content,
        )
    except Exception:
        pass

    return invitation


@router.get("/invitations/conferences/{conference_id}", response_model=PCInvitationListResponse)
def list_invitations(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_chair),
):
    invitations = (
        db.query(PCInvitationModel)
        .filter(PCInvitationModel.conference_id == conference_id)
        .order_by(PCInvitationModel.created_at.desc())
        .all()
    )
    return PCInvitationListResponse(invitations=invitations, total=len(invitations))


@router.post("/invitations/accept", response_model=PCMemberResponse)
def accept_invitation(
    request: PCAcceptRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    invitation = db.query(PCInvitationModel).filter(PCInvitationModel.token == request.token).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if invitation.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Invitation already {invitation.status}")

    if invitation.expires_at:
        exp = invitation.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if _now_utc() > exp:
            invitation.status = "EXPIRED"
            db.commit()
            raise HTTPException(status_code=400, detail="Invitation expired")

    if current_user.email.lower() != invitation.email.lower():
        raise HTTPException(status_code=403, detail="This invitation does not belong to your account")

    # Ensure global role exists and is assigned (so reviewer endpoints work)
    desired_role = invitation.role or "reviewer"
    role_model = db.query(RoleModel).filter(RoleModel.name == desired_role).first()
    if not role_model:
        role_model = RoleModel(name=desired_role)
        db.add(role_model)
        db.commit()
        db.refresh(role_model)

    # attach role if missing
    if role_model not in current_user.roles:
        current_user.roles.append(role_model)
        db.commit()
        db.refresh(current_user)

    # Create membership row
    existing = (
        db.query(ConferencePCMemberModel)
        .filter(
            ConferencePCMemberModel.conference_id == invitation.conference_id,
            ConferencePCMemberModel.user_id == current_user.id,
        )
        .first()
    )
    if not existing:
        member = ConferencePCMemberModel(
            conference_id=invitation.conference_id,
            user_id=current_user.id,
            role=desired_role,
        )
        db.add(member)
    invitation.status = "ACCEPTED"
    db.commit()

    member_row = (
        db.query(ConferencePCMemberModel)
        .filter(
            ConferencePCMemberModel.conference_id == invitation.conference_id,
            ConferencePCMemberModel.user_id == current_user.id,
        )
        .first()
    )
    return PCMemberResponse(
        conference_id=member_row.conference_id,
        user_id=member_row.user_id,
        role=member_row.role,
        user_email=current_user.email,
        user_full_name=current_user.full_name,
        created_at=member_row.created_at,
    )


@router.get("/members/conferences/{conference_id}", response_model=PCMemberListResponse)
def list_pc_members(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_chair),
):
    rows = (
        db.query(ConferencePCMemberModel)
        .filter(ConferencePCMemberModel.conference_id == conference_id)
        .all()
    )
    members: list[PCMemberResponse] = []
    for row in rows:
        user = db.query(UserModel).filter(UserModel.id == row.user_id).first()
        members.append(
            PCMemberResponse(
                conference_id=row.conference_id,
                user_id=row.user_id,
                role=row.role,
                user_email=user.email if user else None,
                user_full_name=user.full_name if user else None,
                created_at=row.created_at,
            )
        )
    return PCMemberListResponse(members=members, total=len(members))

