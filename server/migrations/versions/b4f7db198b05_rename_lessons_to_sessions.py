"""Rename lessons table to sessions and lesson_id to session_id

Revision ID: b4f7db198b05
Revises: b1c2d3e4f5a6
Create Date: 2025-01-01 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4f7db198b05'
down_revision: Union[str, Sequence[str], None] = 'b1c2d3e4f5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First, find and drop the foreign key constraint on schedule_items.lesson_id
    # PostgreSQL auto-generates constraint names, so we need to find it dynamically
    connection = op.get_bind()
    
    # Find the constraint name by looking for FK constraints on lesson_id column
    result = connection.execute(sa.text("""
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'schedule_items' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'lesson_id'
    """))
    
    constraint_name = None
    for row in result:
        constraint_name = row[0]
        break
    
    # Drop the constraint if it exists
    if constraint_name:
        op.drop_constraint(constraint_name, 'schedule_items', type_='foreignkey')
    
    # Rename column from lesson_id to session_id in schedule_items table using SQL
    # op.execute('ALTER TABLE schedule_items RENAME COLUMN lesson_id TO session_id')
    
    # Rename table from lessons to sessions
    op.rename_table('lessons', 'sessions')
    
    # Recreate the foreign key constraint with new column name
    op.create_foreign_key(
        'schedule_items_session_id_fkey',
        'schedule_items',
        'sessions',
        ['session_id'],
        ['id']
    )


def downgrade() -> None:
    # Drop the new foreign key constraint
    connection = op.get_bind()
    
    # Find the constraint name by looking for FK constraints on session_id column
    result = connection.execute(sa.text("""
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'schedule_items' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'session_id'
    """))
    
    constraint_name = None
    for row in result:
        constraint_name = row[0]
        break
    
    if constraint_name:
        op.drop_constraint(constraint_name, 'schedule_items', type_='foreignkey')
    
    # Rename table back from sessions to lessons first
    op.rename_table('sessions', 'lessons')
    
    # Rename column back from session_id to lesson_id using SQL
    op.execute('ALTER TABLE schedule_items RENAME COLUMN session_id TO lesson_id')
    
    # Recreate the old foreign key constraint
    op.create_foreign_key(
        'schedule_items_lesson_id_fkey',
        'schedule_items',
        'lessons',
        ['lesson_id'],
        ['id']
    )
