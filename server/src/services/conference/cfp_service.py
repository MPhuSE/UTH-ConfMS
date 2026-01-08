from datetime import datetime
from typing import Dict, Any
from infrastructure.repositories_interfaces.conference_repository import ConferenceRepository
from domain.exceptions import NotFoundError # Sử dụng exception có sẵn trong dự án của bạn

class CFPService:
    def __init__(self, conference_repo: ConferenceRepository):
        self.conference_repo = conference_repo

    def update_cfp_content(self, conf_id: int, description: str, submission_deadline: datetime) -> Any:
        """
        Xử lý logic cập nhật nội dung Call For Papers (CNPM-54)
        """
        # 1. Lấy dữ liệu từ Repo (Trả về Domain Entity)
        conference = self.conference_repo.get_by_id(conf_id)
        
        if not conference:
            # Sử dụng thông báo lỗi giống như các service khác của bạn
            raise ValueError(f"Không tìm thấy hội nghị với ID {conf_id}")

        # 2. Gọi logic thay đổi trạng thái trong Domain Entity
        # Hàm update_cfp đã được chúng ta thêm vào class Conference ở bước trước
        conference.update_cfp(
            description=description, 
            submission_deadline=submission_deadline
        )

        # 3. Lưu lại vào Database thông qua Repository
        return self.conference_repo.save(conference)

    def get_public_cfp(self, conf_id: int) -> Dict[str, Any]:
        """
        Lấy thông tin CFP để hiển thị công khai (CNPM-55)
        """
        # 1. Truy vấn hội nghị
        conference = self.conference_repo.get_by_id(conf_id)
        
        if not conference:
            raise ValueError(f"Hội nghị {conf_id} không tồn tại")

        # 2. Trả về một dictionary chứa các thông tin cần thiết cho Schema PublicCFPResponse
        return {
            "name": conference.name,
            "abbreviation": conference.abbreviation,
            "description": conference.description,
            "submission_deadline": conference.submission_deadline,
            "is_open": conference.is_open
        }