from sqlalchemy import ForeignKeyConstraint, UniqueConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base


class Schedule(Base):
    __tablename__ = "schedules"
    __table_args__ = (
        ForeignKeyConstraint(["route_id"], ["routes.id"]),
        UniqueConstraint("route_id", "dow"),
    )
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    route_id: Mapped[int] = mapped_column(nullable=False)
    dow: Mapped[int] = mapped_column(nullable=False)
    start_time: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
