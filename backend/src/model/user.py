from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from src.db import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    pass
