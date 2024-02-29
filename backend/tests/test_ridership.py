import struct
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest
from src.handlers.ridership import (
    RidershipFilterModel,
    get_ridership,
    post_ridership_stats,
)
from src.hardware import HardwareErrorCode, HardwareHTTPException, HardwareOKResponse
from src.model.analytics import Analytics
from src.model.route import Route
from src.model.user import User
from src.model.van import Van


@pytest.fixture
def mock_van_model():
    return Van(id=1, route_id=1, wheelchair=False)


def new_mock_ridership(time: datetime):
    return Analytics(
        van_id=1,
        route_id=1,
        entered=5,
        exited=3,
        lat=37.7749,
        lon=-122.4194,
        datetime=time,
    )


def mock_analytics_body(analytics: Analytics, time: datetime):
    async def inner():
        return struct.pack(
            "<Qbbdd",
            int(time.timestamp() * 1000),
            analytics.entered,
            analytics.exited,
            analytics.lat,
            analytics.lon,
        )

    return inner


@pytest.mark.asyncio
async def test_post_ridership_stats_with_prior(mock_route_args, mock_van_model):
    # Arrange
    now = datetime.now(timezone.utc).replace(microsecond=0)
    prior_ridership = new_mock_ridership(now - timedelta(minutes=1))
    new_ridership = new_mock_ridership(now)
    mock_route_args.req.body = mock_analytics_body(new_ridership, now)
    mock_route_args.session.add(mock_van_model)
    mock_route_args.session.add(prior_ridership)
    mock_route_args.session.commit()

    # Act
    response = await post_ridership_stats(
        mock_route_args.req, mock_van_model.id, User()
    )

    # Assert
    assert response == HardwareOKResponse()
    assert mock_route_args.session.query(Analytics).filter_by(datetime=now).count() > 0


@pytest.mark.asyncio
async def test_post_ridership_stats_without_prior(mock_route_args, mock_van_model):
    # Arrange
    now = datetime.now(timezone.utc).replace(microsecond=0)
    new_ridership = new_mock_ridership(now)
    mock_route_args.req.body = mock_analytics_body(new_ridership, now)
    mock_route_args.session.add(mock_van_model)
    mock_route_args.session.commit()

    # Act
    response = await post_ridership_stats(
        mock_route_args.req, mock_van_model.id, User()
    )

    # Assert
    assert response == HardwareOKResponse()
    assert mock_route_args.session.query(Analytics).filter_by(datetime=now).count() > 0


@pytest.mark.asyncio
async def test_post_ridership_stats_too_far_in_past(mock_route_args, mock_van_model):
    # Arrange
    now = datetime.now(timezone.utc).replace(microsecond=0) - timedelta(minutes=2)
    new_ridership = new_mock_ridership(now)
    mock_route_args.req.body = mock_analytics_body(new_ridership, now)
    mock_route_args.session.add(mock_van_model)
    mock_route_args.session.commit()

    # Act
    with pytest.raises(HardwareHTTPException) as e:
        await post_ridership_stats(mock_route_args.req, mock_van_model.id, User())

    # Assert
    assert e.value.status_code == 400
    assert e.value.error_code == HardwareErrorCode.TIMESTAMP_TOO_FAR_IN_PAST
    assert mock_route_args.session.query(Analytics).filter_by(datetime=now).count() == 0


@pytest.mark.asyncio
async def test_post_ridership_stats_in_future(mock_route_args, mock_van_model):
    # Arrange
    now = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(minutes=2)
    new_ridership = new_mock_ridership(now)
    mock_route_args.req.body = mock_analytics_body(new_ridership, now)
    mock_route_args.session.add(mock_van_model)
    mock_route_args.session.commit()

    # Act
    with pytest.raises(HardwareHTTPException) as e:
        await post_ridership_stats(mock_route_args.req, mock_van_model.id, User())

    # Assert
    assert e.value.status_code == 400
    assert e.value.error_code == HardwareErrorCode.TIMESTAMP_IN_FUTURE
    assert mock_route_args.session.query(Analytics).filter_by(datetime=now).count() == 0


@pytest.mark.asyncio
async def test_post_ridership_van_not_active_invalid_param(
    mock_route_args, mock_van_model
):
    # Arrange
    now = datetime.now(timezone.utc).replace(microsecond=0)
    new_ridership = new_mock_ridership(now)
    mock_route_args.req.body = mock_analytics_body(new_ridership, now)
    mock_route_args.session.add(mock_van_model)
    mock_route_args.session.commit()

    # Act
    with pytest.raises(HardwareHTTPException) as e:
        await post_ridership_stats(mock_route_args.req, 16, User())

    # Assert
    assert e.value.status_code == 404
    assert e.value.error_code == HardwareErrorCode.VAN_NOT_ACTIVE
    assert mock_route_args.session.query(Analytics).filter_by(datetime=now).count() == 0


@pytest.mark.asyncio
async def test_post_ridership_van_not_active_valid_param(mock_route_args):
    # Arrange
    now = datetime.now(timezone.utc).replace(microsecond=0)
    new_ridership = new_mock_ridership(now)
    mock_route_args.req.body = mock_analytics_body(new_ridership, now)

    # Act
    with pytest.raises(HardwareHTTPException) as e:
        await post_ridership_stats(mock_route_args.req, 1, User())

    # Assert
    assert e.value.status_code == 404
    assert e.value.error_code == HardwareErrorCode.VAN_NOT_ACTIVE
    assert mock_route_args.session.query(Analytics).filter_by(datetime=now).count() == 0


@pytest.mark.asyncio
async def test_post_ridership_stats_not_most_recent(mock_route_args, mock_van_model):
    # Arrange
    now = datetime.now(timezone.utc).replace(microsecond=0)
    new_ridership = new_mock_ridership(now)
    prior_ridership = new_mock_ridership(now + timedelta(minutes=1))
    mock_route_args.req.body = mock_analytics_body(new_ridership, now)
    mock_route_args.session.add(mock_van_model)
    mock_route_args.session.add(prior_ridership)
    mock_route_args.session.commit()

    # Act
    with pytest.raises(HardwareHTTPException) as e:
        await post_ridership_stats(mock_route_args.req, mock_van_model.id, User())

    # Assert
    assert e.value.status_code == 400
    assert e.value.error_code == HardwareErrorCode.TIMESTAMP_NOT_MOST_RECENT
    assert mock_route_args.session.query(Analytics).filter_by(datetime=now).count() == 0


@pytest.mark.parametrize(
    "filter_params, expected_count",
    [
        (
            RidershipFilterModel(
                route_id=None, van_id=None, start_timestamp=None, end_timestamp=None
            ),
            10,
        ),  # No filters, expect all records
        (
            RidershipFilterModel(
                route_id=1, van_id=None, start_timestamp=None, end_timestamp=None
            ),
            5,
        ),  # Filter by route_id
        (
            RidershipFilterModel(
                route_id=None, van_id=1, start_timestamp=None, end_timestamp=None
            ),
            5,
        ),  # Filter by van_id
        (
            RidershipFilterModel(
                route_id=None,
                van_id=None,
                start_timestamp=int(datetime(2022, 1, 1).timestamp()),
                end_timestamp=None,
            ),
            10,
        ),  # Filter by start_date
        (
            RidershipFilterModel(
                route_id=None,
                van_id=None,
                start_timestamp=None,
                end_timestamp=int(datetime(2022, 1, 6).timestamp()),
            ),
            10,
        ),  # Filter by end_date
        (
            RidershipFilterModel(
                route_id=1,
                van_id=1,
                start_timestamp=int(datetime(2022, 1, 1).timestamp()),
                end_timestamp=int(datetime(2022, 1, 6).timestamp()),
            ),
            5,
        ),  # Filter by all parameters
        (
            RidershipFilterModel(
                route_id=99, van_id=None, start_timestamp=None, end_timestamp=None
            ),
            0,
        ),  # Filter by non-existent route_id
        (
            RidershipFilterModel(
                route_id=None, van_id=99, start_timestamp=None, end_timestamp=None
            ),
            0,
        ),  # Filter by non-existent van_id
        (
            RidershipFilterModel(
                route_id=None,
                van_id=None,
                start_timestamp=int(datetime(2023, 1, 1).timestamp()),
                end_timestamp=None,
            ),
            0,
        ),  # Filter by future start_date
        (
            RidershipFilterModel(
                route_id=None,
                van_id=None,
                start_timestamp=None,
                end_timestamp=int(datetime(2021, 1, 1).timestamp()),
            ),
            0,
        ),  # Filter by past end_date
    ],
)
def test_get_ridership(mock_route_args, filter_params, expected_count):
    # Arrange
    mock_route_args.session.add_all(
        [
            Analytics(
                van_id=1,
                route_id=1,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 2, tzinfo=timezone.utc),
            ),
            Analytics(
                van_id=1,
                route_id=1,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 3, tzinfo=timezone.utc),
            ),
            Analytics(
                van_id=1,
                route_id=1,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 4, tzinfo=timezone.utc),
            ),
            Analytics(
                van_id=1,
                route_id=1,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 5, tzinfo=timezone.utc),
            ),
            Analytics(
                van_id=1,
                route_id=1,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 6, tzinfo=timezone.utc),
            ),
            Analytics(
                van_id=2,
                route_id=2,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 2, tzinfo=timezone.utc),
            ),
            Analytics(
                van_id=2,
                route_id=2,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 3, tzinfo=timezone.utc),
            ),
            Analytics(
                van_id=2,
                route_id=2,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 4, tzinfo=timezone.utc),
            ),
            Analytics(
                van_id=2,
                route_id=2,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 5, tzinfo=timezone.utc),
            ),
            Analytics(
                van_id=2,
                route_id=2,
                entered=1,
                exited=1,
                lat=37.7749,
                lon=-122.4194,
                datetime=datetime(2022, 1, 6, tzinfo=timezone.utc),
            ),
        ]
    )
    mock_route_args.session.commit()

    response = get_ridership(mock_route_args.req, filter_params, User())
    assert len(response) == expected_count
