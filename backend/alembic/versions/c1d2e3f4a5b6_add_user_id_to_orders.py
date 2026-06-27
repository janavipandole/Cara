"""Add user_id FK to orders and create order_status_history table

Revision ID: c1d2e3f4a5b6
Revises: a1b2c3d4e5f6
Create Date: 2026-06-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: link orders to the authenticated user and track status events."""
    # Add nullable user_id FK to existing orders table so existing rows are preserved
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('user_id', sa.Integer(), nullable=True)
        )
        batch_op.create_index('ix_orders_user_id', ['user_id'], unique=False)
        batch_op.create_foreign_key(
            'fk_orders_user_id_users',
            'users',
            ['user_id'],
            ['id'],
        )

    # Create a dedicated audit table for status transitions so the frontend
    # timeline page can replay the full journey of every order.
    op.create_table(
        'order_status_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column(
            'changed_at',
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column('note', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ['order_id'],
            ['orders.id'],
            name='fk_order_status_history_order_id',
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        'ix_order_status_history_id',
        'order_status_history',
        ['id'],
        unique=False,
    )
    op.create_index(
        'ix_order_status_history_order_id',
        'order_status_history',
        ['order_id'],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_order_status_history_order_id', table_name='order_status_history')
    op.drop_index('ix_order_status_history_id', table_name='order_status_history')
    op.drop_table('order_status_history')

    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_constraint('fk_orders_user_id_users', type_='foreignkey')
        batch_op.drop_index('ix_orders_user_id')
        batch_op.drop_column('user_id')
