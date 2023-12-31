from sqlalchemy import ForeignKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base


class Van(Base):
    __tablename__ = "vans"
    __table_args__ = tuple(ForeignKeyConstraint(["route_id"], ["routes.id"]))
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    route_id: Mapped[int] = mapped_column(nullable=False)
    wheelchair: Mapped[bool] = mapped_column(nullable=False)

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, Van)
            and self.route_id == __value.route_id
            and self.wheelchair == __value.wheelchair
        )

    def __repr__(self) -> str:
        return (
            f"<Van id={self.id} route_id={self.route_id} wheelchair={self.wheelchair}>"
        )
