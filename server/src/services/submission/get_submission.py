class GetSubmissionService:
    def __init__(self, repo):
        self.repo = repo

    def execute(self, submission_id: int):
        # 1. Repo này bây giờ đã JOIN các bảng (như ta đã sửa ở bước trước)
        submission = self.repo.get_by_id(submission_id)
        
        if not submission:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Không tìm thấy bài nộp")

        # 2. Xử lý logic để lấy File Path (lấy file bản mới nhất hoặc bản đầu tiên)
        # Trong DBML của bạn là bảng submission_files
        file_url = None
        if hasattr(submission, 'files') and submission.files:
            file_url = submission.files[0].file_path

        # 3. Lấy camera-ready file path nếu có
        camera_ready_file_url = None
        if hasattr(submission, 'camera_ready_file') and submission.camera_ready_file:
            camera_ready_file_url = submission.camera_ready_file.file_path
        elif hasattr(submission, 'camera_ready_submission') and submission.camera_ready_submission:
            # Nếu có camera_ready_submission ID nhưng chưa load relationship
            # Sử dụng file_path property từ model (ưu tiên camera-ready)
            camera_ready_file_url = getattr(submission, 'file_path', None)

        # 4. Xây dựng cấu trúc trả về khớp với Frontend yêu cầu
        # Convert NUMERIC to float safely
        avg_score_value = None
        if submission.avg_score is not None:
            try:
                # Handle both Decimal and float types
                avg_score_value = float(str(submission.avg_score))
            except (ValueError, TypeError, AttributeError):
                avg_score_value = None
        
        final_score_value = None
        if submission.final_score is not None:
            try:
                # Handle both Decimal and float types
                final_score_value = float(str(submission.final_score))
            except (ValueError, TypeError, AttributeError):
                final_score_value = None
        
        # Debug logging - Use INFO level để dễ thấy
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"[GetSubmission] ID={submission.id}, avg_score from DB: {submission.avg_score} (type={type(submission.avg_score)}), final_score from DB: {submission.final_score} (type={type(submission.final_score)})")
        logger.info(f"[GetSubmission] Converted: avg_score={avg_score_value}, final_score={final_score_value}")
        
        # Đảm bảo conference_id và track_id được trả về
        conference_id = None
        track_id = None
        if submission.track:
            track_id = submission.track.id
            if submission.track.conference:
                conference_id = submission.track.conference.id
        
        result_dict = {
            "id": submission.id,
            "conference_id": conference_id,
            "track_id": track_id,
            "title": submission.title,
            "abstract": submission.abstract,
            "status": submission.status,
            "decision": submission.decision,
            "file_path": camera_ready_file_url or file_url,  # Ưu tiên camera-ready file
            "camera_ready_submission": submission.camera_ready_submission,  # QUAN TRỌNG: Trả về ID để frontend biết đã upload
            "created_at": submission.created_at.isoformat() if hasattr(submission, 'created_at') and submission.created_at else None,
            # Scores - Convert NUMERIC to float - LUÔN TRẢ VỀ, kể cả khi None
            "avg_score": avg_score_value,
            "final_score": final_score_value,
            # Lấy thông tin Track và Conference qua mối quan hệ
            "track": {
                "id": submission.track.id,
                "name": submission.track.name,
                "conference": {
                    "id": submission.track.conference.id,
                    "name": submission.track.conference.name,
                    "abbreviation": getattr(submission.track.conference, 'abbreviation', None)
                }
            } if submission.track else None,
            # Map danh sách tác giả từ bảng users thông qua submission_authors
            "authors": [
                {
                    "full_name": sa.user.full_name,
                    "email": sa.user.email,
                    "affiliation": sa.user.affiliation,
                    "order_index": sa.order_index
                } for sa in (submission.authors or [])
            ]
        }
        
        # Debug: Log final result dict
        logger.info(f"[GetSubmission] Final result dict keys: {list(result_dict.keys())}")
        logger.info(f"[GetSubmission] Final result scores: avg_score={result_dict.get('avg_score')}, final_score={result_dict.get('final_score')}")
        
        return result_dict