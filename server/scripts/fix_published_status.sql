-- Script SQL để fix status của các submission đã có camera_ready_submission nhưng status vẫn là "accepted"
-- Chạy script này trong database để cập nhật status = "published" cho các submission đã upload camera-ready

-- Tìm và cập nhật các submission có camera_ready_submission nhưng status không phải "published"
UPDATE submissions
SET status = 'published'
WHERE camera_ready_submission IS NOT NULL
  AND status != 'published'
  AND status IS NOT NULL;

-- Kiểm tra kết quả
SELECT 
    id,
    title,
    status,
    decision,
    camera_ready_submission
FROM submissions
WHERE camera_ready_submission IS NOT NULL
ORDER BY id;
