from sqlalchemy import ForeignKeyConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base


class Waypoint(Base):
    __tablename__ = "waypoints"
    __table_args__ = (
        ForeignKeyConstraint(["route_id"], ["routes.id"]),
        UniqueConstraint("route_id", "lat", "lon"),
    )
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    route_id: Mapped[int] = mapped_column(nullable=False)
    lat: Mapped[float] = mapped_column(nullable=False)
    lon: Mapped[float] = mapped_column(nullable=False)

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, Waypoint)
            and self.route_id == __value.route_id
            and self.lat == __value.lat
            and self.lon == __value.lon
        )

    def __repr__(self) -> str:
        return f"<Waypoint id={self.id} route_id={self.route_id} lat={self.lat} lon={self.lon}>"
