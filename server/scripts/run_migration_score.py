#!/usr/bin/env python3
"""
Migration script: Add score column to reviews table
Run this script to add the score column if it doesn't exist.
"""

import sys
import os

# Try to activate venv if it exists
venv_path = os.path.join(os.path.dirname(__file__), '..', 'venv')
if os.path.exists(venv_path):
    if sys.platform == 'win32':
        venv_python = os.path.join(venv_path, 'Scripts', 'python.exe')
    else:
        venv_python = os.path.join(venv_path, 'bin', 'python')
    if os.path.exists(venv_python):
        print(f"Using venv Python: {venv_python}")

# Add parent directory to path to import config
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    from sqlalchemy import create_engine, text, inspect
    from config import settings
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Please make sure you have activated the virtual environment and installed dependencies.")
    print("Try: source venv/bin/activate (Linux/Mac) or venv\\Scripts\\activate (Windows)")
    sys.exit(1)

def run_migration():
    """Run migration to add score column to reviews table."""
    try:
        # Create database engine
        engine = create_engine(settings.DATABASE_URL)
        
        # Check if column exists
        with engine.connect() as conn:
            # Check if column exists
            inspector = inspect(engine)
            columns = [col['name'] for col in inspector.get_columns('reviews')]
            
            if 'score' in columns:
                print("✓ Column 'score' already exists in 'reviews' table")
                return True
            
            # Add column if it doesn't exist
            print("Adding 'score' column to 'reviews' table...")
            conn.execute(text("""
                ALTER TABLE reviews 
                ADD COLUMN score INTEGER;
            """))
            
            # Add comment
            conn.execute(text("""
                COMMENT ON COLUMN reviews.score IS 'Điểm số từ 0-10 (hoặc scale khác tùy conference). Có thể được submit trực tiếp hoặc tính từ answers.';
            """))
            
            conn.commit()
            print("✓ Successfully added 'score' column to 'reviews' table")
            return True
            
    except Exception as e:
        print(f"✗ Error running migration: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Migration: Add score column to reviews table")
    print("=" * 60)
    
    success = run_migration()
    
    if success:
        print("\n✓ Migration completed successfully!")
        sys.exit(0)
    else:
        print("\n✗ Migration failed!")
        sys.exit(1)
