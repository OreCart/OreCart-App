# from sqlalchemy import UniqueConstraint
# from sqlalchemy.orm import Mapped, mapped_column, relationship
# from src.db.base import Base
# from typing import List


# class PickupSpotModel(Base):
#     __tablename__ = "pickup_spots"
#     id: Mapped[int] = mapped_column(
#         primary_key=True, autoincrement=True
#     )
#     name: Mapped[str] = mapped_column(unique=True)
#     lat: Mapped[float] = mapped_column(nullable=False)
#     lon: Mapped[float] = mapped_column(nullable=False)

#     ada_requests: Mapped[List["ADARequestModel"]] = relationship(
#         back_populates="pickup_spot",
#         cascade="all, delete-orphan")

#     def __eq__(self, __value: object) -> bool:
#         # Exclude ID since it'll always differ, only compare on content
#         return isinstance(__value, PickupSpotModel) and self.name == __value.name

#     def __repr__(self) -> str:
#         return f"<PickupSpot id={self.id} name={self.name}>"
