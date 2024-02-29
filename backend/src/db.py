import os

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session


class DBWrapper:
    def __init__(self):
        self.engine = create_async_engine(
            os.environ["DATABASE_URL"], pool_size=15, max_overflow=5
        )

    def async_session(self) -> AsyncSession:
        return AsyncSession(self.engine)

    def session(self) -> Session:
        # everything except the FastAPI Users code uses non-async code. This makes it
        # possible to use FastAPI Users without modifying existing database code to be
        # asynchronous.
        return Session(self.engine.sync_engine)


class Base(DeclarativeBase):
    """
    This makes an instance of DeclarativeBase which is the inherited model for all models.
    This is an alternative to using declarative_base from sqlalchemy.orm and making
    a new instance of DeclarativeBase upon the creation of each new model.
    """

    pass
