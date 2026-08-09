"""add last_active_at to users

Revision ID: 5b7c9d1e3f4a
Revises: f1a2b3c4d5e6
Create Date: 2026-08-09 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b7c9d1e3f4a'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add a sliding last_active_at marker for server-side idle enforcement."""
    op.add_column('users', sa.Column('last_active_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Drop last_active_at."""
    op.drop_column('users', 'last_active_at')
