# from datetime import datetime

# from sqlalchemy import ForeignKeyConstraint, UniqueConstraint
# from sqlalchemy.orm import Mapped, mapped_column
# from src.db.base import Base
# from src.model.types import TZDateTime


# class ScheduleModel(Base):
#     __tablename__ = "schedules"
#     __table_args__ = (
#         ForeignKeyConstraint(["route_id"], ["routes.id"]),
#         UniqueConstraint("route_id", "dow"),
#     )
#     id: Mapped[int] = mapped_column(
#         primary_key=True, autoincrement=True,
#     )
#     route_id: Mapped[int] = mapped_column()
#     dow: Mapped[int] = mapped_column()
#     start_time: Mapped[datetime] = mapped_column(TZDateTime)
#     end_time: Mapped[datetime] = mapped_column(TZDateTime)

#     def __eq__(self, __value: object) -> bool:
#         # Exclude ID since it'll always differ, only compare on content
#         return (
#             isinstance(__value, ScheduleModel)
#             and self.route_id == __value.route_id
#             and self.dow == __value.dow
#             and self.start_time == __value.start_time
#             and self.end_time == __value.end_time
#         )

#     def __repr__(self) -> str:
#         return f"<Schedule id={self.id} route_id={self.route_id} dow={self.dow} start_time={self.start_time} end_time={self.end_time}>"
