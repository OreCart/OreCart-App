from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from src.db.base import Base


class StopDisableModel(Base):
    __tablename__ = "stop_disables"
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    alert_id: Mapped[int] = mapped_column(ForeignKey("alerts.id"))
    stop_id: Mapped[int] = mapped_column(ForeignKey("stops.id"))

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, StopDisableModel)
            and self.alert_id == __value.alert_id
            and self.stop_id == __value.stop_id
        )

    def __repr__(self) -> str:
        return f"<StopDisable id={self.id} alert_id={self.alert_id} stop_id={self.stop_id}>"
