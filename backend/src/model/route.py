from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from src.db import Base


class RouteModel(Base):
    __tablename__ = "routes"
    __table_args__ = tuple(UniqueConstraint("name"))
    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True, nullable=False
    )
    name: Mapped[str] = mapped_column(unique=True, nullable=False)
