from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from api.schemas.email_template_schema import (
    EmailTemplateCreateRequest, EmailTemplateUpdateRequest, EmailTemplateResponse
)
from infrastructure.databases.postgres import get_db
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin_or_chair
from services.email_template.email_template_service import EmailTemplateService
from domain.exceptions import NotFoundError

router = APIRouter(prefix="/email-templates", tags=["Email Templates"])


def get_email_template_service(db: Session = Depends(get_db)):
    return EmailTemplateService(db)


@router.post("", response_model=EmailTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_email_template(
    request: EmailTemplateCreateRequest,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_email_template_service)
):
    """Create an email template - only admin or chair can create."""
    try:
        result = service.create_template(
            conference_id=request.conference_id,
            name=request.name,
            subject=request.subject,
            body=request.body
        )
        return EmailTemplateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{template_id}", response_model=EmailTemplateResponse)
def get_email_template(
    template_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_email_template_service)
):
    """Get an email template by ID."""
    try:
        template = service.get_template(template_id)
        if not template:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
        return EmailTemplateResponse(**template)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/conferences/{conference_id}", response_model=List[EmailTemplateResponse])
def get_templates_by_conference(
    conference_id: int,
    current_user=Depends(get_current_user),
    service=Depends(get_email_template_service)
):
    """Get all email templates for a conference."""
    try:
        templates = service.get_templates_by_conference(conference_id)
        return [EmailTemplateResponse(**t) for t in templates]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{template_id}", response_model=EmailTemplateResponse)
def update_email_template(
    template_id: int,
    request: EmailTemplateUpdateRequest,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_email_template_service)
):
    """Update an email template - only admin or chair can update."""
    try:
        result = service.update_template(
            template_id=template_id,
            name=request.name,
            subject=request.subject,
            body=request.body
        )
        return EmailTemplateResponse(**result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_email_template(
    template_id: int,
    current_user=Depends(require_admin_or_chair),
    service=Depends(get_email_template_service)
):
    """Delete an email template - only admin or chair can delete."""
    try:
        service.delete_template(template_id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

