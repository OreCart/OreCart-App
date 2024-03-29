"""create pickup spots table

Revision ID: 38c5326f0334
Revises: d53db4ccb3fc
Create Date: 2024-02-22 10:17:36.297413

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "38c5326f0334"
down_revision: Union[str, None] = "d53db4ccb3fc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "pickup_spots",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("lat", sa.Float, nullable=False),
        sa.Column("lon", sa.Float, nullable=False),
        sa.UniqueConstraint("name"),
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS public.pickup_spots;
    """
    )
