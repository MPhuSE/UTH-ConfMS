"""
Script to fix tracks table sequence in PostgreSQL.
This fixes the issue where sequence is out of sync with actual data.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from src.config import settings

def fix_tracks_sequence():
    """Fix the tracks table sequence to match the highest ID + 1"""
    try:
        # Get sync database URL (remove asyncpg if present)
        database_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        engine = create_engine(database_url, echo=False)
        
        with engine.connect() as conn:
            # Get the current max ID
            result = conn.execute(text("SELECT COALESCE(MAX(id), 0) FROM tracks"))
            max_id = result.scalar()
            
            print(f"Current max ID in tracks table: {max_id}")
            
            # Reset sequence to max_id + 1
            next_id = max_id + 1
            conn.execute(text(f"SELECT setval('tracks_id_seq', {next_id}, false)"))
            conn.commit()
            
            print(f"✅ Fixed tracks sequence. Next ID will be: {next_id}")
            
            # Verify
            result = conn.execute(text("SELECT last_value FROM tracks_id_seq"))
            last_value = result.scalar()
            print(f"✅ Sequence last_value is now: {last_value}")
            
    except Exception as e:
        print(f"❌ Error fixing sequence: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 50)
    print("Fixing tracks table sequence...")
    print("=" * 50)
    
    if fix_tracks_sequence():
        print("\n✅ Sequence fixed successfully!")
    else:
        print("\n❌ Failed to fix sequence")
        sys.exit(1)
