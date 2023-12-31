"""
Routes for tracking ridership statistics.
"""

import struct
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Union

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, model_validator
from sqlalchemy.sql import ColumnElement
from src.hardware import HardwareErrorCode, HardwareHTTPException, HardwareOKResponse
from src.model.analytics import Analytics
from src.model.van import Van

router = APIRouter(prefix="/analytics/ridership", tags=["analytics", "ridership"])


class RidershipFilterModel(BaseModel):
    start_timestamp: Optional[int] = None
    end_timestamp: Optional[int] = None
    route_id: Optional[int]
    van_id: Optional[int]

    @model_validator(mode="after")
    def check_dates(self):
        if self.end_timestamp is not None and self.start_timestamp is not None:
            if self.end_timestamp <= self.start_timestamp:
                raise ValueError("End timestamp must be after start timestamp")
        return self

    @property
    def start_date(self) -> Optional[datetime]:
        if self.start_timestamp is not None:
            return datetime.fromtimestamp(self.start_timestamp, timezone.utc)
        return None

    @property
    def end_date(self) -> Optional[datetime]:
        if self.end_timestamp is not None:
            return datetime.fromtimestamp(self.end_timestamp, timezone.utc)
        return None

    @property
    def filters(self) -> Optional[List[ColumnElement[bool]]]:
        t_filters = []
        if self.start_date is not None:
            t_filters.append(Analytics.datetime >= self.start_date)
        if self.end_date is not None:
            t_filters.append(Analytics.datetime <= self.end_date)
        if self.route_id is not None:
            t_filters.append(Analytics.route_id == self.route_id)
        if self.van_id is not None:
            t_filters.append(Analytics.van_id == self.van_id)
        if len(t_filters) == 0:
            return None
        return t_filters


@router.post("/{van_id}")
async def post_ridership_stats(req: Request, van_id: int):
    """
    This route is used by the hardware components to send ridership statistics to be
    logged in the database. The body of the request is a packed byte array containing
    the following values in order:
    - timestamp of time when response was sent (64-bit seconds since epoch)
    - entered (8-bit, number of people who entered the van at a given stop)
    - exited (8-bit, number of people who exited the van at the stop)
    - lat (double-precision float, current latitude of the van at the stop)
    - lon (double-precision float, current longitude of the van at the stop)
    """

    # Unpack the byte body sent by the hardware into their corresponding values
    body = await req.body()
    timestamp, entered, exited, lat, lon = struct.unpack("!lbbdd", body)
    timestamp = datetime.fromtimestamp(timestamp, timezone.utc)

    current_time = datetime.now(timezone.utc)

    # Check that the timestamp is not too far in the past. This implies a statistics
    # update that was delayed in transit and may be irrelevant now.
    if current_time - timestamp > timedelta(minutes=1):
        raise HardwareHTTPException(
            status_code=400, error_code=HardwareErrorCode.TIMESTAMP_TOO_FAR_IN_PAST
        )

    # Check that the timestamp is not in the future. This implies a hardware clock
    # malfunction.
    if timestamp > current_time:
        raise HardwareHTTPException(
            status_code=400, error_code=HardwareErrorCode.TIMESTAMP_IN_FUTURE
        )

    with req.app.state.db.session() as session:
        # Find the route that the van is currently on, required by the ridership database.
        # If there is no route, then the van does not exist or is not running.
        van = session.query(Van).filter_by(id=van_id).first()
        if not van:
            raise HardwareHTTPException(
                status_code=404, error_code=HardwareErrorCode.VAN_NOT_ACTIVE
            )

        # Check that the timestamp is the most recent one for the van. This prevents
        # updates from being sent out of order, which could mess up the statistics.
        most_recent = (
            session.query(Analytics)
            .filter_by(van_id=van_id)
            .order_by(Analytics.datetime.desc())
            .first()
        )
        if most_recent is not None and timestamp <= most_recent.datetime:
            raise HardwareHTTPException(
                status_code=400, error_code=HardwareErrorCode.TIMESTAMP_NOT_MOST_RECENT
            )

        # Finally commit the ridership statistics to the database.
        new_ridership = Analytics(
            van_id=van_id,
            route_id=van.route_id,
            entered=entered,
            exited=exited,
            lat=lat,
            lon=lon,
            datetime=timestamp,
        )
        session.add(new_ridership)
        session.commit()

    return HardwareOKResponse()


@router.get("/")
def get_ridership(
    req: Request, filters: Optional[RidershipFilterModel]
) -> List[Dict[str, Union[str, int, float]]]:
    with req.app.state.db.session() as session:
        analytics: List[Analytics] = []
        if filters is None or filters.filters is None:
            analytics = session.query(Analytics).all()
        else:
            analytics = session.query(Analytics).filter(*filters.filters).all()

    # convert analytics to json
    analytics_json: List[Dict[str, Union[str, int, float]]] = []
    for analytic in analytics:
        analytics_json.append(
            {
                "vanId": analytic.van_id,
                "routeId": analytic.route_id,
                "entered": analytic.entered,
                "exited": analytic.exited,
                "lat": analytic.lat,
                "lon": analytic.lon,
                "datetime": int(analytic.datetime.timestamp()),
            }
        )

    return analytics_json
