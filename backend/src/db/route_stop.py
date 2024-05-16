from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


class RouteStopModel(Base):
    __tablename__ = "route_stops"
    __table_args__ = (UniqueConstraint("route_id", "stop_id"),)
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id"))
    stop_id: Mapped[int] = mapped_column(ForeignKey("stops.id"))
    position: Mapped[int] = mapped_column()

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, RouteStopModel)
            and self.route_id == __value.route_id
            and self.stop_id == __value.stop_id
        )

    def __repr__(self) -> str:
        return (
            f"<RouteStop id={self.id} route_id={self.route_id} stop_id={self.stop_id}>"
        )
