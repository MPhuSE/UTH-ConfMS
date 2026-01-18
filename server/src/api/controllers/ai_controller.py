from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from infrastructure.security.auth_dependencies import get_current_user
from services.ai.ai_service import AIServiceManager, MockAIService

router = APIRouter(prefix="/ai", tags=["AI Services"])


def get_ai_service() -> AIServiceManager:
    """Get AI service manager."""
    mock_service = MockAIService()
    return AIServiceManager(mock_service, enabled_features={
        "spell_check": True,
        "summary": True,
        "similarity": True,
        "keywords": True
    })


class SpellCheckRequest(BaseModel):
    text: str


class SpellCheckResponse(BaseModel):
    has_errors: bool
    suggestions: List[str]
    confidence: float


class SummaryRequest(BaseModel):
    text: str
    max_words: int = 200


class SummaryResponse(BaseModel):
    summary: str


class SimilarityRequest(BaseModel):
    text1: str
    text2: str


class SimilarityResponse(BaseModel):
    similarity_score: float


class KeywordsRequest(BaseModel):
    text: str


class KeywordsResponse(BaseModel):
    keywords: List[str]


class EmailTemplateRequest(BaseModel):
    template_type: str
    context: str
    conference_id: Optional[int] = None


class EmailTemplateResponse(BaseModel):
    subject: str
    body: str


@router.post("/spell-check", response_model=SpellCheckResponse)
def check_spell_grammar(
    request: SpellCheckRequest,
    current_user=Depends(get_current_user),
    ai_service: AIServiceManager = Depends(get_ai_service)
):
    """Check spelling and grammar."""
    result = ai_service.check_spell_grammar(request.text)
    if result is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Spell check is disabled")
    return SpellCheckResponse(**result)


@router.post("/summary", response_model=SummaryResponse)
def generate_summary(
    request: SummaryRequest,
    current_user=Depends(get_current_user),
    ai_service: AIServiceManager = Depends(get_ai_service)
):
    """Generate a neutral summary."""
    summary = ai_service.generate_summary(request.text, request.max_words)
    if summary is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Summary generation is disabled")
    return SummaryResponse(summary=summary)


@router.post("/similarity", response_model=SimilarityResponse)
def calculate_similarity(
    request: SimilarityRequest,
    current_user=Depends(get_current_user),
    ai_service: AIServiceManager = Depends(get_ai_service)
):
    """Calculate similarity between two texts."""
    similarity = ai_service.calculate_similarity(request.text1, request.text2)
    if similarity is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Similarity calculation is disabled")
    return SimilarityResponse(similarity_score=similarity)


@router.post("/keywords", response_model=KeywordsResponse)
def extract_keywords(
    request: KeywordsRequest,
    current_user=Depends(get_current_user),
    ai_service: AIServiceManager = Depends(get_ai_service)
):
    """Extract keywords from text."""
    keywords = ai_service.extract_keywords(request.text)
    if keywords is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Keyword extraction is disabled")
    return KeywordsResponse(keywords=keywords)


@router.post("/email-template", response_model=EmailTemplateResponse)
def generate_email_template(
    request: EmailTemplateRequest,
    current_user=Depends(get_current_user),
    ai_service: AIServiceManager = Depends(get_ai_service)
):
    """Generate email template draft using AI."""
    # Mock implementation - in production, this would call AI service
    template_types = {
        "notification": {
            "subject": f"Notification: {request.context[:50]}",
            "body": f"Dear Author,\n\n{request.context}\n\nBest regards,\nConference Committee"
        },
        "acceptance": {
            "subject": "Paper Accepted",
            "body": f"Dear Author,\n\nWe are pleased to inform you that your paper has been accepted.\n\n{request.context}\n\nBest regards,\nConference Committee"
        },
        "rejection": {
            "subject": "Paper Decision",
            "body": f"Dear Author,\n\nThank you for your submission. After careful review, we regret to inform you that your paper was not accepted.\n\n{request.context}\n\nBest regards,\nConference Committee"
        },
        "reminder": {
            "subject": "Reminder",
            "body": f"Dear Participant,\n\nThis is a reminder: {request.context}\n\nBest regards,\nConference Committee"
        },
        "invitation": {
            "subject": "Invitation",
            "body": f"Dear Colleague,\n\nWe would like to invite you to: {request.context}\n\nBest regards,\nConference Committee"
        }
    }
    
    template = template_types.get(request.template_type, template_types["notification"])
    return EmailTemplateResponse(**template)

