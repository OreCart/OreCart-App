from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base
from src.model.types import TZDateTime


class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    text: Mapped[str] = mapped_column(nullable=False)
    start_datetime: Mapped[datetime] = mapped_column(TZDateTime, nullable=False)
    end_datetime: Mapped[datetime] = mapped_column(TZDateTime, nullable=False)

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, Alert)
            and self.text == __value.text
            and self.start_datetime == __value.start_datetime
            and self.end_datetime == __value.end_datetime
        )

    def __repr__(self) -> str:
        return f"<Alert id={self.id} text={self.text} start_datetime={self.start_datetime} end_datetime={self.end_datetime}>"
