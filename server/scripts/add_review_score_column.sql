-- Migration: Add score column to reviews table
-- This allows reviewers to submit a direct score (0-10) for each review

-- Add score column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS score INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN reviews.score IS 'Điểm số từ 0-10 (hoặc scale khác tùy conference). Có thể được submit trực tiếp hoặc tính từ answers.';

-- Optional: Create index for faster queries if needed
-- CREATE INDEX IF NOT EXISTS idx_reviews_score ON reviews(score) WHERE score IS NOT NULL;
