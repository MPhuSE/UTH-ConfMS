"""add_score_column_to_reviews

Revision ID: a1b2c3d4e5f6
Revises: f9a1b2c3d4e5
Create Date: 2026-01-24 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'f9a1b2c3d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add score column to reviews table
    op.add_column('reviews', sa.Column('score', sa.Integer(), nullable=True))
    
    # Add comment for documentation
    op.execute("COMMENT ON COLUMN reviews.score IS 'Điểm số từ 0-10 (hoặc scale khác tùy conference). Có thể được submit trực tiếp hoặc tính từ answers.'")


def downgrade() -> None:
    # Remove score column from reviews table
    op.drop_column('reviews', 'score')
