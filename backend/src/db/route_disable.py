from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


class RouteDisableModel(Base):
    __tablename__ = "route_disables"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    alert_id: Mapped[int] = mapped_column(ForeignKey("alerts.id"))
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id"))

    def __eq__(self, __value: object) -> bool:
        # Exclude ID since it'll always differ, only compare on content
        return (
            isinstance(__value, RouteDisableModel)
            and self.alert_id == __value.alert_id
            and self.route_id == __value.route_id
        )

    def __repr__(self) -> str:
        return f"<RouteDisable id={self.id} alert_id={self.alert_id} route_id={self.route_id}>"
