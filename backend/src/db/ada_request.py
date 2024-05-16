# from datetime import datetime

# from sqlalchemy import ForeignKey
# from sqlalchemy.orm import Mapped, mapped_column, relationship
# from src.db.base import Base
# from src.model.types import TZDateTime

# from typing import Optional


# class ADARequestModel(Base):
#     __tablename__ = "ada_requests"
#     id: Mapped[int] = mapped_column(
#         primary_key=True, autoincrement=True
#     )
#     pickup_spot: Mapped[int] = mapped_column(ForeignKey("pickup_spots.id"))
#     pickup_time: Mapped[datetime] = mapped_column(TZDateTime)
#     wheelchair: Mapped[bool] = mapped_column()

#     pickup_spot: Mapped["PickupSpot"] = relationship(
#         back_populates="ada_requests",
#         cascade="all, delete-orphan")

#     def __eq__(self, __value: object) -> bool:
#         # Exclude ID since it'll always differ, only compare on content
#         return (
#             isinstance(__value, ADARequestModel)
#             and self.pickup_spot == __value.pickup_spot
#             and self.pickup_time == __value.pickup_time
#             and self.wheelchair == __value.wheelchair
#         )

#     def __repr__(self) -> str:
#         return f"<AdaRequest id={self.id} pickup_spot={self.pickup_spot} pickup_time={self.pickup_time} wheelchair={self.wheelchair}>"
