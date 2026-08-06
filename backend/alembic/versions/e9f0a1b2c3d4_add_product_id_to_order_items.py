"""add product_id to order_items

Revision ID: e9f0a1b2c3d4
Revises: d8e4f1a2b3c4
Create Date: 2026-08-06 22:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e9f0a1b2c3d4"
down_revision: Union[str, Sequence[str], None] = "d8e4f1a2b3c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("order_items", sa.Column("product_id", sa.Integer(), nullable=True))
    op.create_index(
        op.f("ix_order_items_product_id"), "order_items", ["product_id"], unique=False
    )
    op.create_foreign_key(
        "fk_order_items_product_id_products",
        "order_items",
        "products",
        ["product_id"],
        ["id"],
    )
    # Best-effort backfill from product name for existing rows.
    op.execute(
        """
        UPDATE order_items
        SET product_id = (
            SELECT products.id FROM products
            WHERE products.name = order_items.product_name
            ORDER BY products.id
            LIMIT 1
        )
        WHERE product_id IS NULL
        """
    )


def downgrade() -> None:
    op.drop_constraint("fk_order_items_product_id_products", "order_items", type_="foreignkey")
    op.drop_index(op.f("ix_order_items_product_id"), table_name="order_items")
    op.drop_column("order_items", "product_id")
