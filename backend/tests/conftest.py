from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from src.db.base import Base


class MockRouteArgs:
    def __init__(
        self,
        req: Request,
        session: AsyncSession,
    ) -> None:
        self.req = req
        self.session = session


@pytest.fixture
async def mock_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    # https://stackoverflow.com/questions/68230481/sqlalchemy-attributeerror-asyncengine-object-has-no-attribute-run-ddl-visit
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(bind=engine)
    return Session()


@pytest.fixture
def mock_route_args(mock_session) -> MockRouteArgs:
    mock_req = MagicMock()
    mock_req.app.state.db.session.return_value = mock_session
    return MockRouteArgs(session=mock_session, req=mock_req)


@pytest.fixture
def mock_datetime():
    return datetime.fromtimestamp(1691623800, timezone.utc)
