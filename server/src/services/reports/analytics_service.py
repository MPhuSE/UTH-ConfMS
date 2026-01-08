from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from infrastructure.repositories_interfaces.submission_repository import SubmissionRepository
from infrastructure.repositories_interfaces.review_repository import ReviewRepository
from infrastructure.repositories_interfaces.conference_repository import ConferenceRepository
from infrastructure.models.submission_model import SubmissionModel, SubmissionAuthorModel
from infrastructure.models.review_model import ReviewModel, ReviewAssignmentModel
from infrastructure.models.conference_model import TrackModel


class AnalyticsService:
    """Service for generating reports and analytics."""
    
    def __init__(
        self,
        submission_repo: SubmissionRepository,
        review_repo: ReviewRepository,
        conference_repo: ConferenceRepository,
        db: Session
    ):
        self.submission_repo = submission_repo
        self.review_repo = review_repo
        self.conference_repo = conference_repo
        self.db = db
    
    def get_submissions_by_track(self, conference_id: int) -> Dict[str, Any]:
        """Get submission statistics by track."""
        tracks = self.db.query(TrackModel).filter(
            TrackModel.conference_id == conference_id
        ).all()
        
        result = {}
        for track in tracks:
            submissions = self.db.query(SubmissionModel).filter(
                SubmissionModel.track_id == track.id
            ).all()
            
            result[track.name] = {
                "track_id": track.id,
                "total_submissions": len(submissions),
                "accepted": len([s for s in submissions if s.status == "Accept"]),
                "rejected": len([s for s in submissions if s.status == "Reject"]),
                "pending": len([s for s in submissions if s.status in ["Submitted", "Under Review"]])
            }
        
        return result
    
    def get_review_sla(self, conference_id: int) -> Dict[str, Any]:
        """Get review service-level agreement statistics."""
        # Get all submissions for conference
        tracks = self.db.query(TrackModel).filter(
            TrackModel.conference_id == conference_id
        ).all()
        
        track_ids = [t.id for t in tracks]
        submissions = self.db.query(SubmissionModel).filter(
            SubmissionModel.track_id.in_(track_ids)
        ).all()
        
        submission_ids = [s.id for s in submissions]
        
        # Get all assignments
        assignments = self.db.query(ReviewAssignmentModel).filter(
            ReviewAssignmentModel.submission_id.in_(submission_ids)
        ).all()
        
        # Get all reviews
        reviews = self.db.query(ReviewModel).filter(
            ReviewModel.submission_id.in_(submission_ids)
        ).all()
        
        total_assignments = len(assignments)
        completed_reviews = len(reviews)
        completion_rate = (completed_reviews / total_assignments * 100) if total_assignments > 0 else 0
        
        return {
            "total_assignments": total_assignments,
            "completed_reviews": completed_reviews,
            "pending_reviews": total_assignments - completed_reviews,
            "completion_rate": round(completion_rate, 2)
        }
    
    def get_activity_logs(self, conference_id: int, limit: int = 100) -> List[Dict[str, Any]]:
        """Get activity logs for a conference."""
        # This would typically query audit logs filtered by conference
        # For now, return a placeholder structure
        from infrastructure.models.audit_log_model import AuditLogModel
        
        logs = self.db.query(AuditLogModel).filter(
            AuditLogModel.resource_type == "SUBMISSION"
        ).order_by(AuditLogModel.created_at.desc()).limit(limit).all()
        
        return [
            {
                "id": log.id,
                "action_type": log.action_type,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "user_id": log.user_id,
                "description": log.description,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ]
    
    def get_acceptance_rate_by_school(self, conference_id: int) -> Dict[str, Any]:
        """Get acceptance rate by school/affiliation."""
        tracks = self.db.query(TrackModel).filter(
            TrackModel.conference_id == conference_id
        ).all()
        
        track_ids = [t.id for t in tracks]
        submissions = self.db.query(SubmissionModel).filter(
            SubmissionModel.track_id.in_(track_ids)
        ).all()
        
        # Get authors and their affiliations
        school_stats = {}
        for submission in submissions:
            authors = self.db.query(SubmissionAuthorModel).filter(
                SubmissionAuthorModel.submission_id == submission.id
            ).all()
            
            for author in authors:
                if author.user and author.user.affiliation:
                    school = author.user.affiliation
                    if school not in school_stats:
                        school_stats[school] = {
                            "total": 0,
                            "accepted": 0,
                            "rejected": 0
                        }
                    
                    school_stats[school]["total"] += 1
                    if submission.status == "Accept":
                        school_stats[school]["accepted"] += 1
                    elif submission.status == "Reject":
                        school_stats[school]["rejected"] += 1
        
        # Calculate acceptance rates
        for school, stats in school_stats.items():
            stats["acceptance_rate"] = round(
                (stats["accepted"] / stats["total"] * 100) if stats["total"] > 0 else 0,
                2
            )
        
        return school_stats

