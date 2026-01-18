# services/submission/create_submission.py

class CreateSubmissionService:
    def __init__(self, repo):
        self.repo = repo

    def execute(self, title, abstract, track_id, conference_id, author_id, file_url, authors=None):
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