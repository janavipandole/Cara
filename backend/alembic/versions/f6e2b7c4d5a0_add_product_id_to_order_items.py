"""add product_id to order_items for stable stock restore

Revision ID: f6e2b7c4d5a0
Revises: d8e4f1a2b3c4
Create Date: 2026-08-08 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f6e2b7c4d5a0"
down_revision: Union[str, Sequence[str], None] = "d8e4f1a2b3c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Batch mode is required for SQLite, which cannot ALTER TABLE ADD COLUMN
    # with an inline FK constraint (uses a copy-and-recreate strategy).
    with op.batch_alter_table("order_items") as batch_op:
        batch_op.add_column(sa.Column("product_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_order_items_product_id", "products", ["product_id"], ["id"]
        )
    # Backfill existing rows from the stored product name snapshot.
    op.execute(
        """
        UPDATE order_items
        SET product_id = (
            SELECT products.id FROM products WHERE products.name = order_items.product_name
        )
        WHERE product_id IS NULL
        """
    )
    op.create_index(op.f("ix_order_items_product_id"), "order_items", ["product_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_order_items_product_id"), table_name="order_items")
    with op.batch_alter_table("order_items") as batch_op:
        batch_op.drop_column("product_id")
