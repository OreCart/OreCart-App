from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base
from src.db.types import TZDateTime


class AlertModel(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column()
    start_datetime: Mapped[datetime] = mapped_column(TZDateTime)
    end_datetime: Mapped[datetime] = mapped_column(TZDateTime)

    # routes_disabled: Mapped["RouteModel"] = relationship(
    #     back_populates="disabled_by", secondary="route_disables"
    # )
    # stops_disabled: Mapped["StopModel"] = relationship(
    #     back_populates="disabled_by", secondary="route_disables"
    # )

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, AlertModel)
            and self.text == __value.text
            and self.start_datetime == __value.start_datetime
            and self.end_datetime == __value.end_datetime
        )

    def __repr__(self) -> str:
        return f"<Alert id={self.id} text={self.text} start_datetime={self.start_datetime} end_datetime={self.end_datetime}>"
