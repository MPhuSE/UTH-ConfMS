# services/submission/create_submission.py

class CreateSubmissionService:
    def __init__(self, repo, system_repo=None):
        self.repo = repo
        self.system_repo = system_repo

    def execute(self, title, abstract, track_id, conference_id, author_id, file_url, authors=None):
        # 1. Kiểm tra quota từ database
        if self.system_repo:
            settings = self.system_repo.get_settings()
            max_subs = settings.quota_max_submissions_per_user or 10
            
            # Đếm số bài đã nộp của user (vai trò là author_id)
            # Lưu ý: get_by_author của repo trả về danh sách
            current_subs = len(self.repo.get_by_author(author_id))
            
            if current_subs >= max_subs:
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=400, 
                    detail=f"Bạn đã đạt giới hạn tối đa {max_subs} bài nộp cho toàn hệ thống."
                )

        # Gom tất cả vào một dictionary để khớp với hàm create(self, data: dict) của Repo
        submission_data = {
            "title": title,
            "abstract": abstract,
            "track_id": track_id,
            "conference_id": conference_id,
            "author_id": author_id,
            "file_url": file_url,
            "authors": authors
        }
        return self.repo.create(submission_data)