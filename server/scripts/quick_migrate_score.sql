-- Quick migration: Add score column to reviews table
-- Run this SQL directly in your database

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS score INTEGER;

COMMENT ON COLUMN reviews.score IS 'Điểm số từ 0-10 (hoặc scale khác tùy conference). Có thể được submit trực tiếp hoặc tính từ answers.';
