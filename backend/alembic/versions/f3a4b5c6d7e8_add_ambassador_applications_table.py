"""add ambassador_applications table

Revision ID: f3a4b5c6d7e8
Revises: f1a2b3c4d5e6
Create Date: 2026-08-09 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3a4b5c6d7e8'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the ambassador_applications table.

    Without this migration, databases provisioned via ``alembic upgrade head``
    lack the table that ``POST /api/ambassador/apply`` inserts into, causing
    every application request to 500 with ``relation does not exist``.
    """
    op.create_table(
        'ambassador_applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('instagram_handle', sa.String(), nullable=False),
        sa.Column('follower_count', sa.Integer(), nullable=False),
        sa.Column('motivation', sa.String(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ambassador_applications_id'), 'ambassador_applications', ['id'], unique=False)
    op.create_index(op.f('ix_ambassador_applications_email'), 'ambassador_applications', ['email'], unique=False)


def downgrade() -> None:
    """Drop the ambassador_applications table."""
    op.drop_index(op.f('ix_ambassador_applications_email'), table_name='ambassador_applications')
    op.drop_index(op.f('ix_ambassador_applications_id'), table_name='ambassador_applications')
    op.drop_table('ambassador_applications')
