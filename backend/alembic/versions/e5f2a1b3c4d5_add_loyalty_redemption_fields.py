"""add loyalty redemption fields and loyalty_accounts table

Revision ID: e5f2a1b3c4d5
Revises: d8e4f1a2b3c4
Create Date: 2026-08-08 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e5f2a1b3c4d5"
down_revision: Union[str, Sequence[str], None] = "d8e4f1a2b3c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "orders",
        sa.Column("loyalty_points_redeemed", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "orders",
        sa.Column("loyalty_discount", sa.Float(), server_default="0", nullable=False),
    )
    op.create_table(
        "loyalty_accounts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("balance", sa.Integer(), server_default="0", nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_loyalty_accounts_id"), "loyalty_accounts", ["id"], unique=False)
    op.create_index(
        op.f("ix_loyalty_accounts_user_id"), "loyalty_accounts", ["user_id"], unique=True
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_loyalty_accounts_user_id"), table_name="loyalty_accounts")
    op.drop_index(op.f("ix_loyalty_accounts_id"), table_name="loyalty_accounts")
    op.drop_table("loyalty_accounts")
    op.drop_column("orders", "loyalty_discount")
    op.drop_column("orders", "loyalty_points_redeemed")
