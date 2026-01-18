"""Update schema to match DBML specification

Revision ID: 641ca1e557dc
Revises: b4f7db198b05
Create Date: 2025-01-01 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '641ca1e557dc'
down_revision: Union[str, Sequence[str], None] = 'b4f7db198b05'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()
    
    # Helper function to check if column exists
    def column_exists(table_name, column_name):
        result = connection.execute(sa.text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = :table_name AND column_name = :column_name
        """), {"table_name": table_name, "column_name": column_name})
        return result.fetchone() is not None
    
    # 1. Conferences table: đổi website_url thành website, thêm location, đổi double_blind thành blind_mode
    if column_exists('conferences', 'website_url'):
        op.execute('ALTER TABLE conferences RENAME COLUMN website_url TO website')
    
    if not column_exists('conferences', 'location'):
        op.add_column('conferences', sa.Column('location', sa.String(), nullable=True))
    
    # Đổi double_blind boolean thành blind_mode string (single, double, open)
    if not column_exists('conferences', 'blind_mode'):
        op.execute("""
            ALTER TABLE conferences 
            ADD COLUMN blind_mode VARCHAR DEFAULT 'double';
        """)
        if column_exists('conferences', 'double_blind'):
            op.execute("""
                UPDATE conferences 
                SET blind_mode = CASE 
                    WHEN double_blind = true THEN 'double'
                    ELSE 'single'
                END;
            """)
            op.drop_column('conferences', 'double_blind')
    
    # 2. Tracks table: thêm description
    if not column_exists('tracks', 'description'):
        op.add_column('tracks', sa.Column('description', sa.String(), nullable=True))
    
    # 3. Sessions table: thêm room
    if not column_exists('sessions', 'room'):
        op.add_column('sessions', sa.Column('room', sa.String(), nullable=True))
    
    # 4. Submissions table: thêm final_score (có thể đã có từ migration trước)
    if not column_exists('submissions', 'final_score'):
        op.add_column('submissions', sa.Column('final_score', sa.Numeric(19, 2), nullable=True))
    
    # 5. Reviews table: thêm confidence, strengths, weaknesses, recommendation, submitted_at
    if not column_exists('reviews', 'confidence'):
        op.add_column('reviews', sa.Column('confidence', sa.Integer(), nullable=True))
    if not column_exists('reviews', 'strengths'):
        op.add_column('reviews', sa.Column('strengths', sa.String(), nullable=True))
    if not column_exists('reviews', 'weaknesses'):
        op.add_column('reviews', sa.Column('weaknesses', sa.String(), nullable=True))
    if not column_exists('reviews', 'recommendation'):
        op.add_column('reviews', sa.Column('recommendation', sa.String(), nullable=True))
    if not column_exists('reviews', 'submitted_at'):
        op.add_column('reviews', sa.Column('submitted_at', sa.DateTime(), nullable=True))
    
    # Đổi weakness thành weaknesses nếu có dữ liệu
    if column_exists('reviews', 'weakness') and column_exists('reviews', 'weaknesses'):
        op.execute("""
            UPDATE reviews 
            SET weaknesses = weakness 
            WHERE weakness IS NOT NULL AND weaknesses IS NULL;
        """)
    
    # 6. Review_question table: thêm conference_id
    if not column_exists('review_question', 'conference_id'):
        op.add_column('review_question', sa.Column('conference_id', sa.Integer(), nullable=True))
        
        # Check if foreign key already exists
        result = connection.execute(sa.text("""
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'review_question' 
            AND constraint_name = 'fk_review_question_conference'
        """))
        if result.fetchone() is None:
            op.create_foreign_key(
                'fk_review_question_conference',
                'review_question',
                'conferences',
                ['conference_id'],
                ['id']
            )
    
    # 7. Notification_logs table: đổi message thành content, thêm type, is_sent
    if column_exists('notification_logs', 'message') and not column_exists('notification_logs', 'content'):
        op.execute('ALTER TABLE notification_logs RENAME COLUMN message TO content')
    
    if not column_exists('notification_logs', 'type'):
        op.add_column('notification_logs', sa.Column('type', sa.String(), nullable=True))
    if not column_exists('notification_logs', 'is_sent'):
        op.add_column('notification_logs', sa.Column('is_sent', sa.Boolean(), default=False, nullable=True))


def downgrade() -> None:
    # Reverse changes
    op.drop_column('notification_logs', 'is_sent')
    op.drop_column('notification_logs', 'type')
    op.execute('ALTER TABLE notification_logs RENAME COLUMN content TO message')
    
    op.drop_constraint('fk_review_question_conference', 'review_question', type_='foreignkey')
    op.drop_column('review_question', 'conference_id')
    
    op.drop_column('reviews', 'submitted_at')
    op.drop_column('reviews', 'recommendation')
    op.drop_column('reviews', 'weaknesses')
    op.drop_column('reviews', 'strengths')
    op.drop_column('reviews', 'confidence')
    
    try:
        op.drop_column('submissions', 'final_score')
    except Exception:
        pass
    
    op.drop_column('sessions', 'room')
    op.drop_column('tracks', 'description')
    
    # Đổi lại blind_mode thành double_blind
    op.add_column('conferences', sa.Column('double_blind', sa.Boolean(), default=True, nullable=True))
    op.execute("""
        UPDATE conferences 
        SET double_blind = CASE 
            WHEN blind_mode = 'double' THEN true
            ELSE false
        END;
    """)
    op.drop_column('conferences', 'blind_mode')
    op.drop_column('conferences', 'location')
    op.execute('ALTER TABLE conferences RENAME COLUMN website TO website_url')
