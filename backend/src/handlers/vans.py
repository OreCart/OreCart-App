import asyncio
import json
import struct
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Set, Union

from fastapi import APIRouter, HTTPException, Query, Request, WebSocket
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from src.hardware import HardwareErrorCode, HardwareHTTPException, HardwareOKResponse
from src.model.van import Van
from src.request import process_include
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
def get_vans(
    req: Request, include: Union[List[str], None] = Query(default=None)
) -> JSONResponse:
    include_set = process_include(include=include, allowed=INCLUDES)
    with req.app.state.db.session() as session:
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
def get_van(
    req: Request, van_id: int, include: Union[List[str], None] = Query(default=None)
) -> JSONResponse:
    include_set = process_include(include=include, allowed=INCLUDES)
    with req.app.state.db.session() as session:
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
def post_van(req: Request, van_model: VanModel) -> JSONResponse:
    with req.app.state.db.session() as session:
        van = Van(route_id=van_model.route_id, wheelchair=van_model.wheelchair)

        session.add(van)
        session.commit()

    return JSONResponse(content={"message": "OK"})


@router.put("/{van_id}")
def put_van(req: Request, van_id: int, van_model: VanModel) -> JSONResponse:
    with req.app.state.db.session() as session:
        van: Van = session.query(Van).filter_by(id=van_id).first()
        if van is None:
            return JSONResponse(content={"message": "Van not found"}, status_code=404)

        van.route_id = van_model.route_id
        van.wheelchair = van_model.wheelchair

        session.commit()

    return JSONResponse(content={"message": "OK"})


@router.delete("/{van_id}")
def delete_van(req: Request, van_id: int) -> JSONResponse:
    with req.app.state.db.session() as session:
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

    location = req.app.state.van_locations[van_id]
    location_json = {
        "timestamp": int(location.timestamp.timestamp()),
        "latitude": location.latitude,
        "longitude": location.longitude,
    }
    return JSONResponse(content=location_json)


@router.websocket("/location/{van_id}/subscribe")
async def subscribe_location(websocket: WebSocket, van_id: int) -> None:
    if van_id not in websocket.app.state.van_locations:
        raise HTTPException(detail="Van not found", status_code=404)

    await websocket.accept()

    while True:
        location = websocket.app.state.van_locations[van_id]
        location_json = {
            "timestamp": int(location.timestamp.timestamp()),
            "latitude": location.latitude,
            "longitude": location.longitude,
        }
        await websocket.send_json(location_json)
        await asyncio.sleep(2)


@router.post("/location/{van_id}")
async def post_location(req: Request, van_id: int) -> HardwareOKResponse:
    # byte body: long for timestamp, double for lat, double for lon
    body = await req.body()
    timestamp, lat, lon = struct.unpack("!ldd", body)
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

    # Check that the timestamp is the most recent one for the van. This prevents
    # updates from being sent out of order.
    last_location = req.app.state.van_locations.get(van_id)
    if last_location is not None and timestamp < last_location.timestamp:
        raise HardwareHTTPException(
            status_code=400, error_code=HardwareErrorCode.TIMESTAMP_NOT_MOST_RECENT
        )

    req.app.state.van_locations[van_id] = VanLocation(
        timestamp=timestamp, latitude=lat, longitude=lon
    )

    return HardwareOKResponse()


def get_all_van_ids(req: Union[Request, WebSocket]) -> List[int]:
    with req.app.state.db.session() as session:
        return [van_id for (van_id,) in session.query(Van).with_entities(Van.id).all()]


def get_location_for_vans(
    req: Union[Request, WebSocket], van_ids: List[int]
) -> Dict[int, dict[str, Union[str, int]]]:
    locations_json: Dict[int, dict[str, Union[str, int]]] = {}
    for van_id in van_ids:
        if van_id not in req.app.state.van_locations:
            continue

        location = req.app.state.van_locations[van_id]
        locations_json[van_id] = {
            "timestamp": int(location.timestamp.timestamp()),
            "latitude": location.latitude,
            "longitude": location.longitude,
        }

    return locations_json
