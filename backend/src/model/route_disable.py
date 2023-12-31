from sqlalchemy import ForeignKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base


class RouteDisable(Base):
    __tablename__ = "route_disables"
    __table_args__ = (
        ForeignKeyConstraint(["alert_id"], ["alerts.id"]),
        ForeignKeyConstraint(["route_id"], ["routes.id"]),
    )
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    alert_id: Mapped[int] = mapped_column(nullable=False)
    route_id: Mapped[int] = mapped_column(nullable=False)

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, RouteDisable)
            and self.alert_id == __value.alert_id
            and self.route_id == __value.route_id
        )

    def __repr__(self) -> str:
        return f"<RouteDisable id={self.id} alert_id={self.alert_id} route_id={self.route_id}>"
