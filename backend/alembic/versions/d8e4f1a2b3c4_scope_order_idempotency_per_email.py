"""scope order idempotency keys per buyer email

Revision ID: d8e4f1a2b3c4
Revises: c1d7b9ce1707
Create Date: 2026-08-06 19:10:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d8e4f1a2b3c4"
down_revision: Union[str, Sequence[str], None] = "c1d7b9ce1707"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_orders_idempotency_key", table_name="orders")
    op.create_index("ix_orders_idempotency_key", "orders", ["idempotency_key"], unique=False)
    op.create_unique_constraint(
        "uq_orders_email_idempotency_key",
        "orders",
        ["email", "idempotency_key"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_orders_email_idempotency_key", "orders", type_="unique")
    op.drop_index("ix_orders_idempotency_key", table_name="orders")
    op.create_index("ix_orders_idempotency_key", "orders", ["idempotency_key"], unique=True)
