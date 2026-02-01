class ListSubmissionsService:
    def __init__(self, repo):
        self.repo = repo

    def execute(self, conference_id: int = None, tenant_id: int = None):
        return self.repo.get_all(conference_id=conference_id, tenant_id=tenant_id)
