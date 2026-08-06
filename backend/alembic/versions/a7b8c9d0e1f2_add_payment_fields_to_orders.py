"""add payment fields to orders

Revision ID: a7b8c9d0e1f2
Revises: d8e4f1a2b3c4
Create Date: 2026-08-06 22:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "d8e4f1a2b3c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("payment_method", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("payment_intent_id", sa.String(), nullable=True))
    op.create_index(
        op.f("ix_orders_payment_intent_id"), "orders", ["payment_intent_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_orders_payment_intent_id"), table_name="orders")
    op.drop_column("orders", "payment_intent_id")
    op.drop_column("orders", "payment_method")
