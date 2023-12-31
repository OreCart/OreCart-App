from datetime import datetime, timezone
from typing import Any
from unittest.mock import MagicMock

import pytest
from pydantic import BaseModel
from sqlalchemy import create_engine
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


@pytest.fixture
def mock_route_args(mock_session) -> MockRouteArgs:
    mock_req = MagicMock()
    mock_req.app.state.db.session.return_value = mock_session
    return MockRouteArgs(session=mock_session, req=mock_req)


@pytest.fixture
def mock_datetime():
    return datetime.fromtimestamp(1691623800, timezone.utc)
