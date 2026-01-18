"""Initial schema setup (All tables combined)

Revision ID: 59deb36d21f5
Revises: 
Create Date: 2025-12-12 13:06:42.652056
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = '59deb36d21f5'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ----------------------------
    # 1. TABLES WITH NO DEPENDENCY
    # ----------------------------
    op.create_table(
        'conferences',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('abbreviation', sa.String),
        sa.Column('description', sa.String),
        sa.Column('website_url', sa.String),
        sa.Column('start_date', sa.DateTime),
        sa.Column('end_date', sa.DateTime),
        sa.Column('submission_deadline', sa.DateTime),
        sa.Column('review_deadline', sa.DateTime),
        sa.Column('is_open', sa.Boolean),
        sa.Column('double_blind', sa.Boolean),
    )
    op.create_index('ix_conferences_id', 'conferences', ['id'])

    op.create_table(
        'review_question',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('question', sa.String, nullable=False),
        sa.Column('type', sa.String),
        sa.Column('required', sa.Boolean),
    )

    op.create_table(
        'roles',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, nullable=False, unique=True),
    )

    # users must exist early
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String, nullable=False),
        sa.Column('hashed_password', sa.String, nullable=False),
        sa.Column('full_name', sa.String),
        sa.Column('affiliation', sa.String),
        sa.Column('phone_number', sa.String),
        sa.Column('website_url', sa.String),
        sa.Column('is_verified', sa.Boolean),
        sa.Column('is_active', sa.Boolean),
        sa.Column('created_at', sa.DateTime),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_id', 'users', ['id'])

    # ----------------------------
    # 2. TABLES WITH LIGHT DEPENDENCY
    # ----------------------------
    op.create_table(
        'tracks',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('conference_id', sa.Integer, nullable=False),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('max_reviewers', sa.Integer),
        sa.ForeignKeyConstraint(['conference_id'], ['conferences.id']),
    )

    # ----------------------------
    # 3. SUBMISSIONS (NO FK to submission_files yet)
    # ----------------------------
    op.create_table(
        'submissions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('track_id', sa.Integer, nullable=False),
        sa.Column('title', sa.String, nullable=False),
        sa.Column('abstract', sa.String),
        sa.Column('status', sa.String),
        sa.Column('is_withdrawn', sa.Boolean),
        sa.Column('avg_score', sa.Numeric(19, 2)),
        sa.Column('camera_ready_submission', sa.Integer),  # FK added later
        sa.ForeignKeyConstraint(['track_id'], ['tracks.id']),
    )
    op.create_index('ix_submissions_id', 'submissions', ['id'])

    # ----------------------------
    # 4. submission_files (depends on submissions)
    # ----------------------------
    op.create_table(
        'submission_files',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('submission_id', sa.Integer, nullable=False),
        sa.Column('file_path', sa.String, nullable=False),
        sa.Column('mime_type', sa.String),
        sa.Column('write_type', sa.String),
        sa.Column('version', sa.Integer),
        sa.ForeignKeyConstraint(['submission_id'], ['submissions.id']),
    )

    # ----------------------------
    # 5. NOW add missing FK loops safely
    # ----------------------------
    op.create_foreign_key(
        'fk_submissions_camera_ready',
        'submissions',
        'submission_files',
        ['camera_ready_submission'],
        ['id']
    )

    # ----------------------------
    # 6. ALL OTHER TABLES (only depend on users or submissions)
    # ----------------------------

    op.create_table(
        'bidding',
        sa.Column('submission_id', sa.Integer, primary_key=True),
        sa.Column('reviewer_id', sa.Integer, primary_key=True),
        sa.Column('bid', sa.String),
        sa.ForeignKeyConstraint(['submission_id'], ['submissions.id']),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id']),
    )

    op.create_table(
        'conflicts_of_interest',
        sa.Column('submission_id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, primary_key=True),
        sa.Column('coi_type', sa.String),
        sa.Column('detected_by_system', sa.Boolean),
        sa.ForeignKeyConstraint(['submission_id'], ['submissions.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )

    op.create_table(
        'email_templates',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('conference_id', sa.Integer, nullable=False),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('subject', sa.String),
        sa.Column('body', sa.String),
        sa.ForeignKeyConstraint(['conference_id'], ['conferences.id']),
    )

    op.create_table(
        'history_logs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer),
        sa.Column('actor_role', sa.String),
        sa.Column('description', sa.String),
        sa.Column('details', postgresql.JSONB),
        sa.Column('created_at', sa.DateTime),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )
    op.create_index('ix_history_logs_id', 'history_logs', ['id'])

    op.create_table(
        'sessions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('conference_id', sa.Integer, nullable=False),
        sa.Column('name', sa.String, nullable=False),
        sa.ForeignKeyConstraint(['conference_id'], ['conferences.id']),
    )

    op.create_table(
        'notification_logs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer),
        sa.Column('submission_id', sa.Integer),
        sa.Column('type', sa.String),
        sa.Column('content', sa.String),
        sa.Column('is_sent', sa.Boolean),
        sa.Column('created_at', sa.DateTime),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['submission_id'], ['submissions.id']),
    )

    op.create_table(
        'review_assignments',
        sa.Column('submission_id', sa.Integer, primary_key=True),
        sa.Column('reviewer_id', sa.Integer, primary_key=True),
        sa.Column('auto_assigned', sa.Boolean),
        sa.ForeignKeyConstraint(['submission_id'], ['submissions.id']),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id']),
    )

    op.create_table(
        'reviewer_expertise',
        sa.Column('user_id', sa.Integer, primary_key=True),
        sa.Column('keyword', sa.String, primary_key=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )

    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('submission_id', sa.Integer, nullable=False),
        sa.Column('reviewer_id', sa.Integer, nullable=False),
        sa.Column('summary', sa.String),
        sa.Column('weakness', sa.String),
        sa.Column('best_paper_recommendation', sa.Boolean),
        sa.ForeignKeyConstraint(['submission_id'], ['submissions.id']),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id']),
        sa.UniqueConstraint('submission_id', 'reviewer_id', name='uq_review_assignment'),
    )
    op.create_index('ix_reviews_id', 'reviews', ['id'])

    op.create_table(
        'submission_authors',
        sa.Column('submission_id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, primary_key=True),
        sa.Column('order_index', sa.Integer),
        sa.Column('is_corresponding', sa.Boolean),
        sa.Column('country', sa.String),
        sa.ForeignKeyConstraint(['submission_id'], ['submissions.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )

    op.create_table(
        'user_roles',
        sa.Column('user_id', sa.Integer, primary_key=True),
        sa.Column('role_id', sa.Integer, primary_key=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id']),
    )

    op.create_table(
        'review_answers',
        sa.Column('review_id', sa.Integer, primary_key=True),
        sa.Column('question_id', sa.Integer, primary_key=True),
        sa.Column('answer', sa.String),
        sa.ForeignKeyConstraint(['review_id'], ['reviews.id']),
        sa.ForeignKeyConstraint(['question_id'], ['review_question.id']),
    )

    op.create_table(
        'schedule_items',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('conference_id', sa.Integer),
        sa.Column('submission_id', sa.Integer),
        sa.Column('session_id', sa.Integer),
        sa.Column('start_time', sa.DateTime),
        sa.Column('end_time', sa.DateTime),
        sa.ForeignKeyConstraint(['conference_id'], ['conferences.id']),
        sa.ForeignKeyConstraint(['submission_id'], ['submissions.id']),
        sa.ForeignKeyConstraint(['session_id'], ['sessions.id']),
    )


def downgrade() -> None:
    # Reverse order drop
    op.drop_table('schedule_items')
    op.drop_table('review_answers')
    op.drop_table('user_roles')
    op.drop_table('submission_authors')
    op.drop_index('ix_reviews_id', table_name='reviews')
    op.drop_table('reviews')
    op.drop_table('reviewer_expertise')
    op.drop_table('review_assignments')
    op.drop_table('notification_logs')
    op.drop_table('sessions')
    op.drop_index('ix_history_logs_id', table_name='history_logs')
    op.drop_table('history_logs')
    op.drop_table('email_templates')
    op.drop_table('conflicts_of_interest')
    op.drop_table('bidding')
    op.drop_index('ix_submissions_id', table_name='submissions')
    op.drop_table('submission_files')
    op.drop_table('submissions')
    op.drop_table('tracks')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
    op.drop_table('roles')
    op.drop_table('review_question')
    op.drop_index('ix_conferences_id', table_name='conferences')
    op.drop_table('conferences')
