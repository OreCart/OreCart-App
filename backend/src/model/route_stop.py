from sqlalchemy import ForeignKeyConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base


class RouteStop(Base):
    __tablename__ = "route_stops"
    __table_args__ = (
        ForeignKeyConstraint(["route_id"], ["routes.id"]),
        ForeignKeyConstraint(["stop_id"], ["stops.id"]),
        UniqueConstraint("route_id", "stop_id"),
    )
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    route_id: Mapped[int] = mapped_column(nullable=False)
    stop_id: Mapped[int] = mapped_column(nullable=False)

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, RouteStop)
            and self.route_id == __value.route_id
            and self.stop_id == __value.stop_id
        )

    def __repr__(self) -> str:
        return (
            f"<RouteStop id={self.id} route_id={self.route_id} stop_id={self.stop_id}>"
        )
