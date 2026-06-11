"""Initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "property_transactions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("mutation_date", sa.DateTime(), nullable=True),
        sa.Column("price", sa.Float(), nullable=True),
        sa.Column("surface", sa.Float(), nullable=True),
        sa.Column("price_per_m2", sa.Float(), nullable=True),
        sa.Column("property_type", sa.String(50), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("postal_code", sa.String(10), nullable=True),
        sa.Column("department", sa.String(3), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_property_transactions_city"), "property_transactions", ["city"]
    )
    op.create_index(
        op.f("ix_property_transactions_postal_code"),
        "property_transactions",
        ["postal_code"],
    )
    op.create_index(
        op.f("ix_property_transactions_department"),
        "property_transactions",
        ["department"],
    )

    op.create_table(
        "sector_analyses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("sector", sa.String(100), nullable=True),
        sa.Column("department", sa.String(3), nullable=False),
        sa.Column("avg_price_m2", sa.Float(), nullable=True),
        sa.Column("median_price_m2", sa.Float(), nullable=True),
        sa.Column("transaction_count", sa.Integer(), nullable=True),
        sa.Column("yearly_growth_percent", sa.Float(), nullable=True),
        sa.Column("predicted_price_next_year", sa.Float(), nullable=True),
        sa.Column("model_slope", sa.Float(), nullable=True),
        sa.Column("model_intercept", sa.Float(), nullable=True),
        sa.Column("analysis_year", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sector_analyses_city"), "sector_analyses", ["city"])
    op.create_index(
        op.f("ix_sector_analyses_department"), "sector_analyses", ["department"]
    )

    op.create_table(
        "analysis_tasks",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("department", sa.String(3), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("progress", sa.Float(), nullable=False, server_default="0"),
        sa.Column("current_city", sa.String(100), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_analysis_tasks_department"), "analysis_tasks", ["department"]
    )


def downgrade() -> None:
    op.drop_table("analysis_tasks")
    op.drop_table("sector_analyses")
    op.drop_table("property_transactions")
