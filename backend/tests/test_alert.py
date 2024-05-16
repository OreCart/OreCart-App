from datetime import datetime, timedelta, timezone
from typing import List
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from src.controller.AlertController import get_alert_controller
from src.db.alert import AlertModel
from src.models.alert import Alert
from tests.conftest import MockRouteArgs

controller = get_alert_controller()


@pytest.fixture
def mock_alert():
    now = datetime.now(timezone.utc).replace(microsecond=0)
    return Alert(
        id=1,
        text="New Alert",
        start_time=now,
        end_time=now + timedelta(minutes=4),
    )


@pytest.fixture
def mock_alerts():
    now = datetime.now(timezone.utc).replace(microsecond=0)
    alerts = [
        Alert(
            id=1,
            text="Alert 1",
            start_time=now - timedelta(minutes=1),
            end_time=now,
        ),
        Alert(
            id=2,
            text="Alert 2",
            start_time=now - timedelta(minutes=1),
            end_time=now + timedelta(minutes=1),
        ),
        Alert(
            id=3,
            text="Alert 3",
            start_time=now + timedelta(minutes=3),
            end_time=now + timedelta(minutes=6),
        ),
    ]
    return alerts


def new_mock_req(session):
    req = MagicMock()
    req.app.state.db.session.return_value = session
    return req


def test_get_alerts(mock_route_args: MockRouteArgs, mock_alerts: List[Alert]):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    response = controller.get_alerts(mock_route_args.session)

    # Assert
    assert response == [
        {
            "id": mock_alert.id,
            "text": mock_alert.text,
            "startDateTime": int(mock_alert.start_time.timestamp()),
            "endDateTime": int(mock_alert.end_time.timestamp()),
        }
        for mock_alert in mock_alerts
    ]


def test_get_active_alerts(mock_route_args: MockRouteArgs, mock_alerts: List[Alert]):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    response = controller.get_alerts(mock_route_args.req, "active")

    # Assert
    assert response == [
        {
            "id": mock_alerts[1].id,
            "text": mock_alerts[1].text,
            "startDateTime": int(mock_alerts[1].start_time.timestamp()),
            "endDateTime": int(mock_alerts[1].end_time.timestamp()),
        }
    ]


def test_get_future_alerts(mock_route_args: MockRouteArgs, mock_alerts: List[Alert]):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    response = controller.get_alerts(mock_route_args.req, "future")

    # Assert
    assert response == [
        {
            "id": mock_alerts[2].id,
            "text": mock_alerts[2].text,
            "startDateTime": int(mock_alerts[2].start_time.timestamp()),
            "endDateTime": int(mock_alerts[2].end_time.timestamp()),
        }
    ]


def test_get_alerts_invalid_filter(
    mock_route_args: MockRouteArgs, mock_alerts: List[Alert]
):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    with pytest.raises(HTTPException) as e:
        controller.get_alerts(mock_route_args.req, "blah")


def test_get_alert(mock_route_args: MockRouteArgs, mock_alerts: List[Alert]):
    mock_route_args.session.add_all(mock_alerts)
    mock_route_args.session.commit()

    # Act
    response = controller.get_alert(mock_route_args.req, 1)

    # Assert
    assert response == {
        "id": 1,
        "text": "Alert 1",
        "startDateTime": int(mock_alerts[0].start_time.timestamp()),
        "endDateTime": int(mock_alerts[0].end_time.timestamp()),
    }


def test_post_alert(mock_route_args: MockRouteArgs, mock_alert: Alert):
    # Arrange
    alert_model = AlertModel(
        text=mock_alert.text,
        start_time=int(mock_alert.start_time.timestamp()),
        end_time=int(mock_alert.end_time.timestamp()),
    )

    # Act
    response = controller.post_alert(mock_route_args.req, alert_model)

    # Assert
    assert response == {"message": "OK"}
    assert (
        mock_route_args.session.query(Alert).filter_by(id=mock_alert.id).first()
        == mock_alert
    )


def test_update_alert(mock_route_args: MockRouteArgs, mock_alert: Alert):
    # Arrange
    mock_route_args.session.add(mock_alert)
    new_mock_alert = Alert(
        id=mock_alert.id,
        text=mock_alert.text + " (updated)",
        start_time=mock_alert.start_time + timedelta(minutes=1),
        end_time=mock_alert.end_time + timedelta(minutes=2),
    )
    new_alert_model = AlertModel(
        text="New Alert (updated)",
        start_time=int(new_mock_alert.start_time.timestamp()),
        end_time=int(new_mock_alert.end_time.timestamp()),
    )

    # Act
    response = controller.update_alert(
        mock_route_args.req, mock_alert.id, new_alert_model
    )

    # Assert
    assert response == {"message": "OK"}
    assert (
        mock_route_args.session.query(Alert).filter_by(id=new_mock_alert.id).first()
        == new_mock_alert
    )


def test_delete_alert(mock_route_args: MockRouteArgs, mock_alert: Alert):
    # Arrange
    mock_route_args.session.add(mock_alert)

    # Act
    response = controller.delete_alert(mock_route_args.req, mock_alert.id)

    # Assert
    assert response == {"message": "OK"}
    assert mock_route_args.session.query(Alert).filter_by(id=mock_alert.id).count() == 0
