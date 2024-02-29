from datetime import datetime, timezone
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import asyncio
import pytest
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from src.db import Base


class MockRouteArgs:
    def __init__(
        self,
        req,
        session,
    ) -> None:
        self.req = req
        self.session = session


@pytest.fixture
def mock_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()


# @pytest.fixture
def mock_async_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async def init_models():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(init_models())
    asm = async_sessionmaker(bind=engine)
    return asm()


@pytest.fixture
def mock_route_args(mock_session) -> MockRouteArgs:
    mock_req = MagicMock()
    mock_req.app.state.db.session.return_value = mock_session
    mock_req.app.state.db.async_session.return_value = mock_async_session()
    return MockRouteArgs(session=mock_session, req=mock_req)


@pytest.fixture
def mock_datetime():
    return datetime.fromtimestamp(1691623800, timezone.utc)
