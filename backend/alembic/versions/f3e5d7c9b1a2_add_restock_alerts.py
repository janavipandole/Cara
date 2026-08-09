"""add restock_alerts table

Revision ID: f3e5d7c9b1a2
Revises: f1a2b3c4d5e6
Create Date: 2026-08-09 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3e5d7c9b1a2'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'restock_alerts',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.UniqueConstraint('email', 'product_id', name='uq_restock_alerts_email_product'),
    )
    op.create_index(op.f('ix_restock_alerts_email'), 'restock_alerts', ['email'])
    op.create_index(op.f('ix_restock_alerts_id'), 'restock_alerts', ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_restock_alerts_id'), table_name='restock_alerts')
    op.drop_index(op.f('ix_restock_alerts_email'), table_name='restock_alerts')
    op.drop_table('restock_alerts')
