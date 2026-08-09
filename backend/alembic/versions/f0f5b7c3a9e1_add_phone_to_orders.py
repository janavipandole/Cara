"""add phone column to orders

Revision ID: f0f5b7c3a9e1
Revises: d8e4f1a2b3c4
Create Date: 2026-08-07 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f0f5b7c3a9e1"
down_revision: Union[str, Sequence[str], None] = "d8e4f1a2b3c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("phone", sa.String(), nullable=False, server_default=""),
    )
    op.alter_column("orders", "phone", server_default=None)


def downgrade() -> None:
    op.drop_column("orders", "phone")
