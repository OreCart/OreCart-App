from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base


class Stop(Base):
    __tablename__ = "stops"
    __table_args__ = (UniqueConstraint("name"), UniqueConstraint("lat", "lon"))
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    name: Mapped[str] = mapped_column(unique=True, nullable=False)
    lat: Mapped[float] = mapped_column(nullable=False)
    lon: Mapped[float] = mapped_column(nullable=False)
    active: Mapped[bool] = mapped_column(nullable=False)

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, Stop)
            and self.name == __value.name
            and self.lat == __value.lat
            and self.lon == __value.lon
            and self.active == __value.active
        )

    def __repr__(self) -> str:
        return f"<Stop id={self.id} name={self.name} lat={self.lat} lon={self.lon} active={self.active}>"
