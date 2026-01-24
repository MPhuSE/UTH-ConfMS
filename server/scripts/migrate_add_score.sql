-- ============================================
-- Migration: Add score column to reviews table
-- ============================================
-- Run this script in your PostgreSQL database
-- 
-- Usage:
--   psql -U your_username -d your_database -f migrate_add_score.sql
--   OR run directly in psql: \i migrate_add_score.sql
-- ============================================

-- Check if column exists and add if not
DO $$ 
BEGIN
    -- Check if column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'reviews' 
        AND column_name = 'score'
    ) THEN
        -- Add the column
        ALTER TABLE reviews 
        ADD COLUMN score INTEGER;
        
        -- Add comment for documentation
        COMMENT ON COLUMN reviews.score IS 'Điểm số từ 0-10 (hoặc scale khác tùy conference). Có thể được submit trực tiếp hoặc tính từ answers.';
        
        RAISE NOTICE '✓ Column "score" added successfully to "reviews" table';
    ELSE
        RAISE NOTICE '✓ Column "score" already exists in "reviews" table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'score';
