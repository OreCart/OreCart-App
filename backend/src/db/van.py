from sqlalchemy import ForeignKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.db.base import Base


class VanModel(Base):
    __tablename__ = "vans"
    __table_args__ = tuple(ForeignKeyConstraint(["route_id"], ["routes.id"]))
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    route_id: Mapped[int] = mapped_column(nullable=True)
    guid: Mapped[str] = mapped_column(nullable=False)

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, VanModel)
            and self.route_id == __value.route_id
            and self.guid == __value.guid
        )

    def __repr__(self) -> str:
        return f"<Van id={self.id} route_id={self.route_id} guid={self.guid}>"
