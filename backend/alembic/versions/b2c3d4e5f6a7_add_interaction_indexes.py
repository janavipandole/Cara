"""add interaction_indexes

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create indexes to support fast lookup of user interactions
    op.create_index(
        op.f('ix_interactions_user_id_type'),
        'interactions',
        ['user_id', 'interaction_type'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_interactions_user_id_type'), table_name='interactions')
