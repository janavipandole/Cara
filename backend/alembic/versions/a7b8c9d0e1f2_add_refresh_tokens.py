"""add refresh_tokens table

Revision ID: a7b8c9d0e1f2
Revises: f1a2b3c4d5e6
Create Date: 2026-08-09 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a7b8c9d0e1f2'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Persist every issued refresh-token jti per email so replay/rotation
    reuse can be detected (and the family revoked) across restarts/workers."""
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(), nullable=False, index=True),
        sa.Column('jti', sa.String(), nullable=False, index=True, unique=True),
        sa.Column('used', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('revoked_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    """Drop refresh_tokens."""
    op.drop_table('refresh_tokens')
