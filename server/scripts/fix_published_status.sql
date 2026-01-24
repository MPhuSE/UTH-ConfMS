

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
