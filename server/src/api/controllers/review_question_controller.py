from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from infrastructure.databases.postgres import get_db
from infrastructure.security.auth_dependencies import get_current_user
from infrastructure.security.rbac import require_admin_or_chair
from infrastructure.models.review_model import ReviewQuestionModel
from pydantic import BaseModel

router = APIRouter(prefix="/review-questions", tags=["Review Questions"])

class ReviewQuestionCreate(BaseModel):
    conference_id: int
    question: str
    type: str  # text, score, boolean
    required: bool = True

class ReviewQuestionResponse(BaseModel):
    id: int
    conference_id: int
    question: str
    type: str
    required: bool

    class Config:
        from_attributes = True

@router.post("", response_model=ReviewQuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    request: ReviewQuestionCreate,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db)
):
    question = ReviewQuestionModel(
        conference_id=request.conference_id,
        question=request.question,
        type=request.type,
        required=request.required
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question

@router.get("/conference/{conference_id}", response_model=List[ReviewQuestionResponse])
def get_questions_by_conference(
    conference_id: int,
    db: Session = Depends(get_db)
):
    return db.query(ReviewQuestionModel).filter(ReviewQuestionModel.conference_id == conference_id).all()

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: int,
    current_user=Depends(require_admin_or_chair),
    db: Session = Depends(get_db)
):
    question = db.query(ReviewQuestionModel).filter(ReviewQuestionModel.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
