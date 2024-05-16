from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


class StopModel(Base):
    __tablename__ = "stops"
    __table_args__ = (UniqueConstraint("lat", "lon"),)
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(unique=True)
    lat: Mapped[float] = mapped_column()
    lon: Mapped[float] = mapped_column()
    active: Mapped[bool] = mapped_column()

    # routes: Mapped["RouteModel"] = relationship(
    #     back_populates="stops", secondary="route_stops"
    # )
    # disabled_by: Mapped["AlertModel"] = relationship(
    #     back_populates="stops_disabled", secondary="stop_disables"
    # )

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, StopModel)
            and self.name == __value.name
            and self.lat == __value.lat
            and self.lon == __value.lon
            and self.active == __value.active
        )

    def __repr__(self) -> str:
        return f"<Stop id={self.id} name={self.name} lat={self.lat} lon={self.lon} active={self.active}>"
