from datetime import datetime

from sqlalchemy import ForeignKey, ForeignKeyConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from src.db.base import Base
from src.db.types import TZDateTime


class VanLocationModel(Base):
    __tablename__ = "van_location"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        TZDateTime, server_default=func.now()  # pylint: disable=all
    )
    session_id: Mapped[int] = mapped_column(ForeignKey("van_tracker_session.id"))
    lat: Mapped[float] = mapped_column()
    lon: Mapped[float] = mapped_column()

    session: Mapped["VanTrackerSession"] = relationship(back_populates="locations")

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, VanLocationModel)
            and self.created_at == other.created_at
            and self.session_id == other.session_id
            and self.lat == other.lat
            and self.lon == other.lon
        )

    def __repr__(self) -> str:
        return f"<VanLocation id={self.id} created_at={self.created_at} session_id={self.session_id} lat={self.lat} lon={self.lon}>"
