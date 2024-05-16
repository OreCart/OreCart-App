from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


class WaypointModel(Base):
    __tablename__ = "waypoints"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id"))
    lat: Mapped[float] = mapped_column()
    lon: Mapped[float] = mapped_column()

    route: Mapped["RouteModel"] = relationship(back_populates="waypoints")

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, WaypointModel)
            and self.route_id == __value.route_id
            and self.lat == __value.lat
            and self.lon == __value.lon
        )

    def __repr__(self) -> str:
        return f"<Waypoint id={self.id} route_id={self.route_id} lat={self.lat} lon={self.lon}>"
