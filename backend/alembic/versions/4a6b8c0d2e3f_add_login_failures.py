"""add login_failures table

Revision ID: 4a6b8c0d2e3f
Revises: f1a2b3c4d5e6
Create Date: 2026-08-09 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a6b8c0d2e3f'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Persist failed login attempts keyed by email + IP so brute-force
    tracking survives restarts and cannot be evaded by rotating emails."""
    op.create_table(
        'login_failures',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('ip_address', sa.String(), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('locked_until', sa.DateTime(), nullable=True),
        sa.Column('last_attempt_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('email', 'ip_address', name='uq_login_failures_email_ip'),
    )
    op.create_index('ix_login_failures_email', 'login_failures', ['email'])
    op.create_index('ix_login_failures_ip_address', 'login_failures', ['ip_address'])


def downgrade() -> None:
    """Drop the login_failures table."""
    op.drop_index('ix_login_failures_ip_address', table_name='login_failures')
    op.drop_index('ix_login_failures_email', table_name='login_failures')
    op.drop_table('login_failures')
