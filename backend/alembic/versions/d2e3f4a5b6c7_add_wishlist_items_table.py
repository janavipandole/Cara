"""Add server-side wishlist model and migration

Revision ID: d2e3f4a5b6c7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2e3f4a5b6c7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the wishlist_items table with a unique constraint preventing duplicates."""
    op.create_table(
        'wishlist_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ['product_id'],
            ['products.id'],
            name='fk_wishlist_items_product_id',
            ondelete='CASCADE',
        ),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            name='fk_wishlist_items_user_id',
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id'),
        # Prevent a user from adding the same product twice
        sa.UniqueConstraint('user_id', 'product_id', name='uq_wishlist_user_product'),
    )
    op.create_index(
        'ix_wishlist_items_id',
        'wishlist_items',
        ['id'],
        unique=False,
    )
    op.create_index(
        'ix_wishlist_items_user_id',
        'wishlist_items',
        ['user_id'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index('ix_wishlist_items_user_id', table_name='wishlist_items')
    op.drop_index('ix_wishlist_items_id', table_name='wishlist_items')
    op.drop_table('wishlist_items')
