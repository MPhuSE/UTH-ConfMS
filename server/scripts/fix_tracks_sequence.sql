-- Fix tracks table sequence in PostgreSQL
-- This fixes the issue where sequence is out of sync with actual data

-- Get the current max ID
DO $$
DECLARE
    max_id INTEGER;
    next_id INTEGER;
BEGIN
    -- Get max ID from tracks table
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM tracks;
    
    -- Calculate next ID
    next_id := max_id + 1;
    
    -- Reset sequence to next_id
    PERFORM setval('tracks_id_seq', next_id, false);
    
    RAISE NOTICE 'Fixed tracks sequence. Current max ID: %, Next ID will be: %', max_id, next_id;
END $$;

-- Verify the sequence
SELECT last_value FROM tracks_id_seq;
