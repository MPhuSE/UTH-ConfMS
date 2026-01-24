-- Migration: Add score column to reviews table
-- Run this script in your PostgreSQL database

-- Check if column exists first
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'score'
    ) THEN
        ALTER TABLE reviews 
        ADD COLUMN score INTEGER;
        
        COMMENT ON COLUMN reviews.score IS 'Điểm số từ 0-10 (hoặc scale khác tùy conference). Có thể được submit trực tiếp hoặc tính từ answers.';
        
        RAISE NOTICE 'Column score added successfully';
    ELSE
        RAISE NOTICE 'Column score already exists';
    END IF;
END $$;
