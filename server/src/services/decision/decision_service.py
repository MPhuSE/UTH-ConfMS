from typing import List, Dict, Any, Optional
import asyncio
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from infrastructure.models.submission_model import SubmissionModel
from infrastructure.models.review_model import ReviewModel
from domain.exceptions import NotFoundError, BusinessRuleException
from services.email.email_service import EmailService
from services.email.email_templates import EmailTemplates

logger = logging.getLogger(__name__)


class DecisionService:
    """Service for managing submission decisions."""
    
    def __init__(
        self,
        review_repo: ReviewRepository,
        submission_repo: SubmissionRepository,
        db: Session,
        email_service: Optional[EmailService] = None
    ):
        self.review_repo = review_repo
        self.submission_repo = submission_repo
        self.db = db
        self.email_service = email_service or EmailService()
    
    def calculate_average_score(self, submission_id: int) -> Optional[float]:
        """Calculate average score from all reviews."""
        reviews = self.review_repo.get_reviews_by_submission(submission_id)
        if not reviews:
            return None
        
        scores = []
        for review in reviews:
            # Priority 1: Use score field directly (if available)
            if hasattr(review, 'score') and review.score is not None:
                try:
                    score = float(review.score)
                    scores.append(score)
                    continue
                except (ValueError, TypeError):
                    pass
            
            # Priority 2: Get score from review answers (legacy support)
            # Assuming question_id 1 is the score question
            if hasattr(review, 'answers') and review.answers:
                for answer in review.answers:
                    if answer.question_id == 1:  # Adjust based on your schema
                        try:
                            score = float(answer.answer)
                            scores.append(score)
                            break  # Only use first matching answer
                        except (ValueError, TypeError):
                            pass
        
        if not scores:
            return None
        
        return sum(scores) / len(scores)
    
    def make_decision(
        self,
        submission_id: int,
        decision: str,  # "accept" / "reject" / ...
        decision_notes: Optional[str] = None,
        final_score: Optional[float] = None  # Optional: Chair can manually set final score
    ) -> Dict[str, Any]:
        """Make a decision on a submission."""
        submission = self.submission_repo.get_by_id(submission_id)
        if not submission:
            raise NotFoundError(f"Submission {submission_id} not found")
        
        # Calculate average score
        avg_score = self.calculate_average_score(submission_id)
        
        normalized = (decision or "").strip().lower()
        norm_map = {
            "accept": "accepted",
            "accepted": "accepted",
            "reject": "rejected",
            "rejected": "rejected",
            "minor revision": "minor_revision",
            "minor_revision": "minor_revision",
            "major revision": "major_revision",
            "major_revision": "major_revision",
        }
        normalized = norm_map.get(normalized, normalized)
        if normalized not in ("accepted", "rejected", "minor_revision", "major_revision"):
            raise BusinessRuleException("Invalid decision value")

        # Map decision to appropriate status
        # Theo SUBMISSION_WORKFLOW.md - Section 3: Decision (Quyết Định)
        # Status values: submitted, under_review, accepted, rejected, withdrawn
        # Decision values: accepted, rejected, minor_revision, major_revision
        # 
        # Mapping decision → status:
        # - decision = "accepted" → status = "accepted"
        # - decision = "rejected" → status = "rejected"
        # - decision = "minor_revision" → status = "under_review" (để tác giả sửa)
        # - decision = "major_revision" → status = "under_review" (để tác giả sửa)
        status_map = {
            "accepted": "accepted",      # Decision accepted → Status accepted
            "rejected": "rejected",      # Decision rejected → Status rejected
            "minor_revision": "under_review",  # Revision needed → Keep under review
            "major_revision": "under_review"   # Revision needed → Keep under review
        }
        new_status = status_map.get(normalized, "under_review")

        # Update submission: decision và status được set riêng biệt
        # Quan trọng: Status và Decision là 2 trường riêng biệt, không phải luôn giống nhau!
        update_data = {
            "decision": normalized,       # Decision: accepted/rejected/minor_revision/major_revision
            "status": new_status,         # Status: accepted/rejected/under_review
            "avg_score": avg_score
        }
        
        # Final score được set khi có quyết định cuối cùng (accepted hoặc rejected)
        # Final score = avg_score (điểm trung bình từ tất cả reviews)
        # Nếu là revision, chưa có final score (chờ tác giả sửa và review lại)
        if normalized in ("accepted", "rejected"):
            update_data["final_score"] = avg_score
        # Nếu là revision, giữ nguyên final_score hiện tại (nếu có) hoặc để None
        
        if decision_notes:
            update_data["decision_notes"] = decision_notes
        
        updated = self.submission_repo.update(submission_id, update_data)
        
        # Send email notification to authors (async, non-blocking)
        try:
            self._send_decision_notification_async(updated, normalized, decision_notes)
        except Exception as e:
            # Log error but don't fail the decision creation
            logger.error(f"Failed to send decision notification email: {str(e)}", exc_info=True)
        
        return {
            "submission_id": updated.id,
            "status": updated.status,
            "decision": getattr(updated, "decision", None) or updated.status,
            "avg_score": float(avg_score) if avg_score else None,
            "final_score": float(updated.final_score) if updated.final_score else None,
            "decision_notes": getattr(updated, 'decision_notes', None)
        }
    
    def _send_decision_notification_async(
        self,
        submission: SubmissionModel,
        decision: str,
        decision_notes: Optional[str]
    ):
        """Send email notification to authors about the decision (async, non-blocking)."""
        try:
            # Get authors' emails
            author_emails = []
            if submission.authors:
                # Get corresponding author first, or all authors
                corresponding_author = next(
                    (a for a in submission.authors if getattr(a, 'is_corresponding', False)),
                    None
                )
                if corresponding_author:
                    email = getattr(corresponding_author, 'email', None) or (
                        getattr(corresponding_author, 'user', None) and 
                        getattr(corresponding_author.user, 'email', None)
                    )
                    if email:
                        author_emails.append(email)
                else:
                    # If no corresponding author, get all authors' emails
                    for author in submission.authors:
                        email = getattr(author, 'email', None) or (
                            getattr(author, 'user', None) and 
                            getattr(author.user, 'email', None)
                        )
                        if email and email not in author_emails:
                            author_emails.append(email)
            
            if not author_emails:
                logger.warning(f"No author emails found for submission {submission.id}")
                return
            
            # Get conference name
            conference_name = None
            if hasattr(submission, 'track') and submission.track:
                if hasattr(submission.track, 'conference') and submission.track.conference:
                    conference_name = getattr(submission.track.conference, 'name', None)
            
            # Prepare email content
            subject = f"Quyết định bài nộp: {submission.title[:50]}..."
            
            # Get scores for email
            avg_score = getattr(submission, 'avg_score', None)
            final_score = getattr(submission, 'final_score', None)
            
            html_content = EmailTemplates.decision_notification(
                submission_title=submission.title,
                decision=decision,
                decision_notes=decision_notes,
                conference_name=conference_name,
                avg_score=float(avg_score) if avg_score else None,
                final_score=float(final_score) if final_score else None
            )
            
            # Send email to all authors (async, fire-and-forget)
            async def send_emails():
                for email in author_emails:
                    try:
                        await self.email_service.send(
                            to_email=email,
                            subject=subject,
                            html=html_content
                        )
                        logger.info(f"Decision notification email sent to {email} for submission {submission.id}")
                    except Exception as e:
                        logger.error(f"Failed to send email to {email}: {str(e)}")
            
            # Run async function in background
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If loop is already running, schedule the coroutine
                    asyncio.create_task(send_emails())
                else:
                    # If no loop is running, run it
                    loop.run_until_complete(send_emails())
            except RuntimeError:
                # No event loop, create a new one
                asyncio.run(send_emails())
                
        except Exception as e:
            logger.error(f"Error in _send_decision_notification_async: {str(e)}", exc_info=True)
    
    def get_decisions_by_conference(self, conference_id: int) -> List[Dict[str, Any]]:
        """Get all decisions for a conference."""
        # This would need to filter submissions by conference
        # For now, we'll get all submissions
        submissions = self.submission_repo.get_all()
        
        decisions = []
        for submission in submissions:
            # Check if submission belongs to conference (would need conference_id in submission)
            if hasattr(submission, 'track') and submission.track:
                if submission.track.conference_id == conference_id:
                    avg_score = self.calculate_average_score(submission.id)
                    decisions.append({
                        "submission_id": submission.id,
                        "title": submission.title,
                        "status": submission.status,
                        "decision": getattr(submission, "decision", None) or submission.status,
                        "avg_score": float(avg_score) if avg_score else None,
                        "final_score": float(submission.final_score) if submission.final_score else None
                    })
        
        return decisions
    
    def get_decision_statistics(self, conference_id: int) -> Dict[str, Any]:
        """Get decision statistics for a conference."""
        decisions = self.get_decisions_by_conference(conference_id)
        
        total = len(decisions)
        accepted = len([d for d in decisions if (d.get("status") or "").lower() in ("accepted", "accept")])
        rejected = len([d for d in decisions if (d.get("status") or "").lower() in ("rejected", "reject")])
        
        acceptance_rate = (accepted / total * 100) if total > 0 else 0
        
        return {
            "total_submissions": total,
            "accepted": accepted,
            "rejected": rejected,
            "acceptance_rate": round(acceptance_rate, 2)
        }

