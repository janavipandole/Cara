"""add created_at to interactions

Revision ID: a1b2c3d4e5f6
Revises: 2fe393eac288
Create Date: 2026-06-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '2fe393eac288'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'interactions',
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        )
    )
    op.create_index(
        op.f('ix_interactions_created_at'),
        'interactions',
        ['created_at'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_interactions_created_at'), table_name='interactions')
    op.drop_column('interactions', 'created_at')
