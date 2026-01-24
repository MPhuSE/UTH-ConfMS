
import sys
import os

# Thêm path để import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from sqlalchemy.orm import Session
from infrastructure.databases.postgres import get_db
from infrastructure.models.submission_model import SubmissionModel

def fix_published_status():
    """Fix status của các submission có camera_ready_submission nhưng status != 'published'"""
    db: Session = next(get_db())
    
    try:
        # Tìm tất cả submission có camera_ready_submission nhưng status không phải "published"
        submissions_to_fix = db.query(SubmissionModel).filter(
            SubmissionModel.camera_ready_submission.isnot(None),
            SubmissionModel.status != "published"
        ).all()
        
        if not submissions_to_fix:
            print("✅ Không có submission nào cần fix!")
            return
        
        print(f"🔍 Tìm thấy {len(submissions_to_fix)} submission cần fix:")
        for sub in submissions_to_fix:
            print(f"  - ID {sub.id}: status='{sub.status}', camera_ready_submission={sub.camera_ready_submission}")
        
        # Update status thành "published"
        updated_count = 0
        for sub in submissions_to_fix:
            old_status = sub.status
            sub.status = "published"
            updated_count += 1
            print(f"  ✅ Updated submission {sub.id}: '{old_status}' → 'published'")
        
        # Commit tất cả thay đổi
        db.commit()
        print(f"\n✅ Đã cập nhật {updated_count} submission thành công!")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Bắt đầu fix status cho các submission đã có camera-ready...")
    fix_published_status()
    print("✨ Hoàn thành!")
