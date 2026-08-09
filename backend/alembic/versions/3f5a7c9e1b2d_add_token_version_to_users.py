"""add token_version to users

Revision ID: 3f5a7c9e1b2d
Revises: f1a2b3c4d5e6
Create Date: 2026-08-09 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3f5a7c9e1b2d'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add token_version so access tokens can be invalidated on password reset."""
    op.add_column(
        'users',
        sa.Column('token_version', sa.Integer(), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    """Drop token_version."""
    op.drop_column('users', 'token_version')
