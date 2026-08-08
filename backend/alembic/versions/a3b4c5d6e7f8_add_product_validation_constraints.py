"""add non-negative/range check constraints to products

Revision ID: a3b4c5d6e7f8
Revises: f1a2b3c4d5e6
Create Date: 2026-08-08 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'a3b4c5d6e7f8'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Enforce the ProductBase validation at the database layer too.

    Prevents negative price/stock and out-of-range ratings from being written
    by import scripts or anything that bypasses the API schemas.
    """
    with op.batch_alter_table('products') as batch_op:
        batch_op.create_check_constraint('ck_products_price_nonnegative', 'price >= 0')
        batch_op.create_check_constraint('ck_products_stock_nonnegative', 'stock >= 0')
        batch_op.create_check_constraint('ck_products_rating_range', 'rating >= 0 AND rating <= 5')


def downgrade() -> None:
    """Drop the check constraints."""
    with op.batch_alter_table('products') as batch_op:
        batch_op.drop_constraint('ck_products_rating_range', type_='check')
        batch_op.drop_constraint('ck_products_stock_nonnegative', type_='check')
        batch_op.drop_constraint('ck_products_price_nonnegative', type_='check')
