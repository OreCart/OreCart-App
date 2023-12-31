from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db import Base
from src.model.waypoint import Waypoint  # pylint: disable=unused-import


class Route(Base):
    __tablename__ = "routes"
    __table_args__ = (UniqueConstraint("name"),)
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    name: Mapped[str] = mapped_column(unique=True, nullable=False)

    waypoints = relationship("Waypoint", backref="route", cascade="all, delete-orphan")

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return isinstance(__value, Route) and self.name == __value.name

    def __repr__(self) -> str:
        return f"<Route id={self.id} name={self.name}>"
