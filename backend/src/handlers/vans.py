import asyncio
import json
import struct
from datetime import datetime, timedelta, timezone
from typing import Annotated, Dict, List, Optional, Set, Union

from fastapi import APIRouter, Depends, HTTPException, Query, Request, WebSocket
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy.sql.expression import select
from src.auth.make_async import make_async
from src.auth.user_manager import current_user
from src.hardware import HardwareErrorCode, HardwareHTTPException, HardwareOKResponse
from src.model.route import Route
from src.model.route_stop import RouteStop
from src.model.stop import Stop
from src.model.user import User
from src.model.van import Van
from src.request import process_include
from src.vantracking.coordinate import Coordinate
from src.vantracking.location import Location
from starlette.responses import Response


class VanModel(BaseModel):
    """
    A model for the request body to make a new van or update a van
    """

    route_id: int
    wheelchair: bool


class VanLocation(BaseModel):
    """
    A model for the request body to make a new van or update a van
    """

    timestamp: datetime
    latitude: float
    longitude: float


router = APIRouter(prefix="/vans", tags=["vans"])

INCLUDE_LOCATION = "location"
INCLUDES: Set[str] = {
    INCLUDE_LOCATION,
}


@router.get("/")
@make_async
def get_vans(
    req: Request, include: Union[List[str], None] = Query(default=None)
) -> JSONResponse:
    session = req.state.session

    include_set = process_include(include=include, allowed=INCLUDES)
    vans: List[Van] = session.query(Van).all()

    resp: List[Dict[str, Optional[Union[int, float, bool]]]] = [
        {
            "id": van.id,
            "routeId": van.route_id,
            "wheelchair": van.wheelchair,
        }
        for van in vans
    ]

    if INCLUDE_LOCATION in include_set:
        for van in resp:
            van["location"] = req.app.state.van_locations[van["vanId"]]

    return JSONResponse(content=resp)


@router.get("/{van_id}")
@make_async
def get_van(
    req: Request, van_id: int, include: Union[List[str], None] = Query(default=None)
) -> JSONResponse:
    session = req.state.session

    include_set = process_include(include=include, allowed=INCLUDES)
    van: Van = session.query(Van).filter_by(id=van_id).first()
    if van is None:
        return JSONResponse(content={"message": "Van not found"}, status_code=404)

    resp = {
        "id": van_id,
        "routeId": van.route_id,
        "wheelchair": van.wheelchair,
    }

    return JSONResponse(content=resp)


@router.post("/")
@make_async
def post_van(
    req: Request, van_model: VanModel, user: Annotated[User, Depends(current_user)]
) -> JSONResponse:
    session = req.state.session

    van = Van(route_id=van_model.route_id, wheelchair=van_model.wheelchair)

    session.add(van)
    session.commit()

    return JSONResponse(content={"message": "OK"})


@router.put("/{van_id}")
@make_async
def put_van(
    req: Request,
    van_id: int,
    van_model: VanModel,
    user: Annotated[User, Depends(current_user)],
) -> JSONResponse:
    session = req.state.session
    van: Van = session.query(Van).filter_by(id=van_id).first()
    if van is None:
        return JSONResponse(content={"message": "Van not found"}, status_code=404)

    van.route_id = van_model.route_id
    van.wheelchair = van_model.wheelchair

    session.commit()

    return JSONResponse(content={"message": "OK"})


@router.delete("/{van_id}")
@make_async
def delete_van(
    req: Request, van_id: int, user: Annotated[User, Depends(current_user)]
) -> JSONResponse:
    session = req.state.session
    van: Van = session.query(Van).filter_by(id=van_id).first()
    if van is None:
        return JSONResponse(content={"message": "Van not found"}, status_code=404)
    session.query(Van).filter_by(id=van_id).delete()
    session.commit()

    return JSONResponse(content={"message": "OK"})


@router.get("/location/", response_class=Response)
def get_locations(req: Request):
    vans = get_all_van_ids(req)
    return JSONResponse(content=get_location_for_vans(req, vans))


@router.websocket("/location/subscribe/")
async def subscribe_locations(websocket: WebSocket) -> None:
    await websocket.accept()

    vans = get_all_van_ids(websocket)
    while True:
        locations_json = get_location_for_vans(websocket, vans)
        await websocket.send_json(locations_json)
        await asyncio.sleep(2)


@router.get("/location/{van_id}")
def get_location(req: Request, van_id: int) -> JSONResponse:
    if van_id not in req.app.state.van_locations:
        raise HTTPException(detail="Van not found", status_code=404)

    location_json = get_location_for_van(req, van_id)
    return JSONResponse(content=location_json)


@router.websocket("/location/{van_id}/subscribe")
async def subscribe_location(websocket: WebSocket, van_id: int) -> None:
    if van_id not in websocket.app.state.van_locations:
        raise HTTPException(detail="Van not found", status_code=404)

    await websocket.accept()

    while True:
        location_json = get_location_for_van(websocket, van_id)
        await websocket.send_json(location_json)
        await asyncio.sleep(2)


@make_async
def get_all_van_ids(req: Union[Request, WebSocket]) -> List[int]:
    session = req.state.session
    return [van_id for (van_id,) in session.query(Van).with_entities(Van.id).all()]


def get_location_for_vans(
    req: Union[Request, WebSocket], van_ids: List[int]
) -> Dict[int, dict[str, Union[str, int]]]:
    locations_json: Dict[int, dict[str, Union[str, int]]] = {}
    for van_id in van_ids:
        state = req.app.state.van_tracker.get_van(van_id)
        if state is None:
            continue
        locations_json[van_id] = {
            "timestamp": int(state.location.timestamp.timestamp()),
            "latitude": state.location.coordinate.latitude,
            "longitude": state.location.coordinate.longitude,
            "nextStopId": state.next_stop.id,
            "secondsToNextStop": int(state.seconds_to_next_stop.total_seconds()),
        }

    return locations_json


def get_location_for_van(
    req: Union[Request, WebSocket], van_id: int
) -> dict[str, Union[str, int]]:
    state = req.app.state.van_tracker.get_van(van_id)
    if state is None:
        return {}
    return {
        "timestamp": int(state.location.timestamp.timestamp()),
        "latitude": state.location.coordinate.latitude,
        "longitude": state.location.coordinate.longitude,
        "nextStopId": state.next_stop.id,
        "secondsToNextStop": int(state.seconds_to_next_stop.total_seconds()),
    }


@router.post("/location/{van_id}")
async def post_location(
    req: Request, van_id: int, user: Annotated[User, Depends(current_user)]
) -> HardwareOKResponse:
    # byte body: long long for timestamp, double for lat, double for lon
    body = await req.body()
    timestamp_ms, lat, lon = struct.unpack("<Qdd", body)
    timestamp = datetime.fromtimestamp(timestamp_ms / 1000.0, timezone.utc)

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

    # Check that the timestamp is the most recent one for the van. This prevents
    # updates from being sent out of order.
    van_state = req.app.state.van_tracker.get_van(van_id)
    if van_state is not None and timestamp < van_state.location.timestamp:
        raise HardwareHTTPException(
            status_code=400, error_code=HardwareErrorCode.TIMESTAMP_NOT_MOST_RECENT
        )

    # The van may be starting up for the first time, in which we need to initialize it's
    # cache entry and stop list. It's better to do this once rather than coupling it with
    # push_location due to the very expensive stop query we have to do.
    if van_id not in req.app.state.van_tracker:
        async with req.app.state.db.async_session() as asession:
            # Need to find the likely list of stops this van will go on. It's assumed that
            # this will only change between van activations, so we can query once and then
            # cache this list.
            stops = (
                await asession.execute(
                    select(Stop)
                    .join(RouteStop, Stop.id == RouteStop.stop_id)
                    # Make sure all stops will be in order since that's critical for the time estimate
                    .order_by(RouteStop.position)
                    .join(Van, Van.route_id == RouteStop.route_id)
                    .filter(Van.id == van_id)
                    # Ignore inactive stops we won't be going to and thus don't need to estimate times for
                    .filter(Stop.active == True)
                )
                .scalars()
                .all()
            )

            if not stops:
                # No stops implies a van that does not exist
                raise HardwareHTTPException(
                    status_code=400, error_code=HardwareErrorCode.VAN_DOESNT_EXIST
                )

            req.app.state.van_tracker.init_van(van_id, stops)

    req.app.state.van_tracker.push_location(
        van_id,
        Location(
            timestamp=timestamp, coordinate=Coordinate(latitude=lat, longitude=lon)
        ),
    )

    return HardwareOKResponse()
