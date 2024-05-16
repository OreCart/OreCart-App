import datetime as dt

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base
from src.db.types import TZDateTime


class RidershipAnalyticModel(Base):
    __tablename__ = "ridership_analytics"
    __table_args__ = (UniqueConstraint("session_id", "datetime"),)
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("van_tracker_session.id"))
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id"))
    entered: Mapped[int] = mapped_column()
    exited: Mapped[int] = mapped_column()
    lat: Mapped[float] = mapped_column()
    lon: Mapped[float] = mapped_column()
    datetime: Mapped[dt.datetime] = mapped_column(TZDateTime)

    session: Mapped["Session"] = relationship(back_populates="ridership_analytics")
    route: Mapped["RouteModel"] = relationship(back_populates="ridership_analytics")

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, RidershipAnalyticModel)
            and self.session_id == __value.session_id
            and self.route_id == __value.route_id
            and self.entered == __value.entered
            and self.exited == __value.exited
            and self.lat == __value.lat
            and self.lon == __value.lon
            and self.datetime == __value.datetime
        )

    def __repr__(self) -> str:
        return f"<RidershipAnalytics id={self.id} van_id={self.session_id} route_id={self.route_id} entered={self.entered} exited={self.exited} lat={self.lat} lon={self.lon} datetime={self.datetime}>"
