"""merge_heads

Revision ID: d20d26ceefe6
Revises: 641ca1e557dc, a1b2c3d4e5f6
Create Date: 2026-02-01 18:06:08.114511

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd20d26ceefe6'
down_revision: Union[str, Sequence[str], None] = ('641ca1e557dc', 'a1b2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
