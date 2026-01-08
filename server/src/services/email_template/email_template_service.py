from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from infrastructure.models.conference_model import EmailTemplateModel
from domain.exceptions import NotFoundError


class EmailTemplateService:
    """Service for managing email templates."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_template(
        self,
        conference_id: int,
        name: str,
        subject: str,
        body: str
    ) -> Dict[str, Any]:
        """Create an email template."""
        template = EmailTemplateModel(
            conference_id=conference_id,
            name=name,
            subject=subject,
            body=body
        )
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        
        return {
            "id": template.id,
            "conference_id": template.conference_id,
            "name": template.name,
            "subject": template.subject,
            "body": template.body
        }
    
    def get_template(self, template_id: int) -> Optional[Dict[str, Any]]:
        """Get an email template by ID."""
        template = self.db.query(EmailTemplateModel).filter(
            EmailTemplateModel.id == template_id
        ).first()
        
        if not template:
            return None
        
        return {
            "id": template.id,
            "conference_id": template.conference_id,
            "name": template.name,
            "subject": template.subject,
            "body": template.body
        }
    
    def get_templates_by_conference(self, conference_id: int) -> List[Dict[str, Any]]:
        """Get all email templates for a conference."""
        templates = self.db.query(EmailTemplateModel).filter(
            EmailTemplateModel.conference_id == conference_id
        ).all()
        
        return [
            {
                "id": t.id,
                "conference_id": t.conference_id,
                "name": t.name,
                "subject": t.subject,
                "body": t.body
            }
            for t in templates
        ]
    
    def update_template(
        self,
        template_id: int,
        name: Optional[str] = None,
        subject: Optional[str] = None,
        body: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update an email template."""
        template = self.db.query(EmailTemplateModel).filter(
            EmailTemplateModel.id == template_id
        ).first()
        
        if not template:
            raise NotFoundError(f"Email template {template_id} not found")
        
        if name is not None:
            template.name = name
        if subject is not None:
            template.subject = subject
        if body is not None:
            template.body = body
        
        self.db.commit()
        self.db.refresh(template)
        
        return {
            "id": template.id,
            "conference_id": template.conference_id,
            "name": template.name,
            "subject": template.subject,
            "body": template.body
        }
    
    def delete_template(self, template_id: int) -> None:
        """Delete an email template."""
        template = self.db.query(EmailTemplateModel).filter(
            EmailTemplateModel.id == template_id
        ).first()
        
        if not template:
            raise NotFoundError(f"Email template {template_id} not found")
        
        self.db.delete(template)
        self.db.commit()

