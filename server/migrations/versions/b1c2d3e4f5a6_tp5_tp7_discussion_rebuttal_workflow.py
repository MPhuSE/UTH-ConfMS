"""TP5/TP7: discussions, rebuttals, workflow windows, decision notes

Revision ID: b1c2d3e4f5a6
Revises: f9a1b2c3d4e5
Create Date: 2026-01-18 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, Sequence[str], None] = "f9a1b2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # submissions.decision_notes
    op.add_column("submissions", sa.Column("decision_notes", sa.String(), nullable=True))

    # conferences workflow windows
    op.add_column("conferences", sa.Column("rebuttal_open", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("conferences", sa.Column("rebuttal_deadline", sa.DateTime(), nullable=True))
    op.add_column("conferences", sa.Column("camera_ready_open", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("conferences", sa.Column("camera_ready_deadline", sa.DateTime(), nullable=True))

    # submission_discussions
    op.create_table(
        "submission_discussions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("submission_id", sa.Integer(), sa.ForeignKey("submissions.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_submission_discussions_submission_id", "submission_discussions", ["submission_id"])
    op.create_index("ix_submission_discussions_user_id", "submission_discussions", ["user_id"])

    # rebuttals
    op.create_table(
        "rebuttals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("submission_id", sa.Integer(), sa.ForeignKey("submissions.id"), nullable=False),
        sa.Column("author_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("submission_id", name="uq_rebuttals_submission_id"),
    )
    op.create_index("ix_rebuttals_submission_id", "rebuttals", ["submission_id"])
    op.create_index("ix_rebuttals_author_id", "rebuttals", ["author_id"])


def downgrade() -> None:
    op.drop_index("ix_rebuttals_author_id", table_name="rebuttals")
    op.drop_index("ix_rebuttals_submission_id", table_name="rebuttals")
    op.drop_table("rebuttals")

    op.drop_index("ix_submission_discussions_user_id", table_name="submission_discussions")
    op.drop_index("ix_submission_discussions_submission_id", table_name="submission_discussions")
    op.drop_table("submission_discussions")

    op.drop_column("conferences", "camera_ready_deadline")
    op.drop_column("conferences", "camera_ready_open")
    op.drop_column("conferences", "rebuttal_deadline")
    op.drop_column("conferences", "rebuttal_open")

    op.drop_column("submissions", "decision_notes")

