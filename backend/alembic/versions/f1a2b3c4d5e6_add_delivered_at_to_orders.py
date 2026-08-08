"""add delivered_at to orders

Revision ID: f1a2b3c4d5e6
Revises: e9f0a1b2c3d4
Create Date: 2026-08-08 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'e9f0a1b2c3d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add delivered_at so the Estimated Return Date policy engine can
    compute an immutable return deadline as delivered_at + 30 days."""
    op.add_column('orders', sa.Column('delivered_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Drop delivered_at."""
    op.drop_column('orders', 'delivered_at')
