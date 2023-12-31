from sqlalchemy import ForeignKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base


class StopDisable(Base):
    __tablename__ = "stop_disables"
    __table_args__ = (
        ForeignKeyConstraint(["alert_id"], ["alerts.id"]),
        ForeignKeyConstraint(["stop_id"], ["stops.id"]),
    )
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    alert_id: Mapped[int] = mapped_column(nullable=False)
    stop_id: Mapped[int] = mapped_column(nullable=False)

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, StopDisable)
            and self.alert_id == __value.alert_id
            and self.stop_id == __value.stop_id
        )

    def __repr__(self) -> str:
        return f"<StopDisable id={self.id} alert_id={self.alert_id} stop_id={self.stop_id}>"
