from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from src.handlers.alert import (
    AlertModel,
    delete_alert,
    get_alert,
    get_alerts,
    post_alert,
    update_alert,
)
from src.model.alert import Alert
from src.model.user import User


@pytest.fixture
def mock_alert():
    now = datetime.now(timezone.utc).replace(microsecond=0)
    return Alert(
        id=1,
        text="New Alert",
        start_datetime=now,
        end_datetime=now + timedelta(minutes=4),
    )


@pytest.fixture
def mock_alerts():
    now = datetime.now(timezone.utc).replace(microsecond=0)
    alerts = [
        Alert(
            id=1,
            text="Alert 1",
            start_datetime=now - timedelta(minutes=1),
            end_datetime=now,
        ),
        Alert(
            id=2,
            text="Alert 2",
            start_datetime=now - timedelta(minutes=1),
            end_datetime=now + timedelta(minutes=1),
        ),
        Alert(
            id=3,
            text="Alert 3",
            start_datetime=now + timedelta(minutes=3),
            end_datetime=now + timedelta(minutes=6),
        ),
    ]
    return alerts


def new_mock_req(session):
    req = MagicMock()
    req.app.state.db.session.return_value = session
    return req


@pytest.mark.asyncio
async def test_get_alerts(mock_route_args, mock_alerts):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    response = await get_alerts(mock_route_args.req)

    # Assert
    assert response == [
        {
            "id": mock_alert.id,
            "text": mock_alert.text,
            "startDateTime": int(mock_alert.start_datetime.timestamp()),
            "endDateTime": int(mock_alert.end_datetime.timestamp()),
        }
        for mock_alert in mock_alerts
    ]


@pytest.mark.asyncio
async def test_get_active_alerts(mock_route_args, mock_alerts):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    response = await get_alerts(mock_route_args.req, "active")

    # Assert
    assert response == [
        {
            "id": mock_alerts[1].id,
            "text": mock_alerts[1].text,
            "startDateTime": int(mock_alerts[1].start_datetime.timestamp()),
            "endDateTime": int(mock_alerts[1].end_datetime.timestamp()),
        }
    ]


@pytest.mark.asyncio
async def test_get_future_alerts(mock_route_args, mock_alerts):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    response = await get_alerts(mock_route_args.req, "future")

    # Assert
    assert response == [
        {
            "id": mock_alerts[2].id,
            "text": mock_alerts[2].text,
            "startDateTime": int(mock_alerts[2].start_datetime.timestamp()),
            "endDateTime": int(mock_alerts[2].end_datetime.timestamp()),
        }
    ]


@pytest.mark.asyncio
async def test_get_alerts_invalid_filter(mock_route_args, mock_alerts):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    with pytest.raises(HTTPException) as e:
        await get_alerts(mock_route_args.req, "blah")


@pytest.mark.asyncio
async def test_get_alert(mock_route_args, mock_alerts):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    response = await get_alert(mock_route_args.req, 1)

    # Assert
    assert response == {
        "id": 1,
        "text": "Alert 1",
        "startDateTime": int(mock_alerts[0].start_datetime.timestamp()),
        "endDateTime": int(mock_alerts[0].end_datetime.timestamp()),
    }


@pytest.mark.asyncio
async def test_post_alert(mock_route_args, mock_alert):
    # Arrange
    alert_model = AlertModel(
        text=mock_alert.text,
        start_time=int(mock_alert.start_datetime.timestamp()),
        end_time=int(mock_alert.end_datetime.timestamp()),
    )

    # Act
    response = await post_alert(mock_route_args.req, alert_model, User())

    # Assert
    assert response == {"message": "OK"}
    assert (
        mock_route_args.session.query(Alert).filter_by(id=mock_alert.id).first()
        == mock_alert
    )


@pytest.mark.asyncio
async def test_update_alert(mock_route_args, mock_alert):
    # Arrange
    mock_route_args.session.add(mock_alert)
    new_mock_alert = Alert(
        id=mock_alert.id,
        text=mock_alert.text + " (updated)",
        start_datetime=mock_alert.start_datetime + timedelta(minutes=1),
        end_datetime=mock_alert.end_datetime + timedelta(minutes=2),
    )
    new_alert_model = AlertModel(
        text="New Alert (updated)",
        start_time=int(new_mock_alert.start_datetime.timestamp()),
        end_time=int(new_mock_alert.end_datetime.timestamp()),
    )

    # Act
    response = await update_alert(
        mock_route_args.req, mock_alert.id, new_alert_model, User()
    )

    # Assert
    assert response == {"message": "OK"}
    assert (
        mock_route_args.session.query(Alert).filter_by(id=new_mock_alert.id).first()
        == new_mock_alert
    )


@pytest.mark.asyncio
async def test_delete_alert(mock_route_args, mock_alert):
    # Arrange
    mock_route_args.session.add(mock_alert)

    # Act
    response = await delete_alert(mock_route_args.req, mock_alert.id, User())

    # Assert
    assert response == {"message": "OK"}
    assert mock_route_args.session.query(Alert).filter_by(id=mock_alert.id).count() == 0
