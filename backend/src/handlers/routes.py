"""
Contains routes specific to working with routes.
"""

import re
from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from src.model.alert import Alert
from src.model.route import Route
from src.model.route_disable import RouteDisable
from src.model.route_stop import RouteStop
from src.model.waypoint import Waypoint
from src.request import process_include

# JSON field names/include values
FIELD_ID = "id"
FIELD_NAME = "name"
FIELD_STOP_IDS = "stopIds"
FIELD_WAYPOINTS = "waypoints"
FIELD_IS_ACTIVE = "isActive"
FIELD_LATITUDE = "latitude"
FIELD_LONGITUDE = "longitude"
INCLUDES = {
    FIELD_STOP_IDS,
    FIELD_WAYPOINTS,
    FIELD_IS_ACTIVE,
}

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("/")
def get_routes(
    req: Request,
    include: Annotated[list[str] | None, Query()] = None,
):
    """
    Gets all routes.
    """

    include_set = process_include(include, INCLUDES)
    with req.app.state.db.session() as session:
        routes = session.query(Route).all()

        # Be more efficient and load the current alert only once if
        # we need it for the isActive field.
        alert = None
        if FIELD_IS_ACTIVE in include_set:
            alert = get_current_alert(datetime.now(timezone.utc), session)

        routes_json = []
        for route in routes:
            route_json = {FIELD_ID: route.id, FIELD_NAME: route.name}

            # Add related values to the route if included
            if FIELD_STOP_IDS in include_set:
                route_json[FIELD_STOP_IDS] = query_route_stop_ids(route.id, session)

            if FIELD_WAYPOINTS in include_set:
                route_json[FIELD_WAYPOINTS] = query_route_waypoints(route.id, session)

            if FIELD_IS_ACTIVE in include_set:
                route_json[FIELD_IS_ACTIVE] = is_route_active(route.id, alert, session)

            routes_json.append(route_json)

        return routes_json


@router.get("/{route_id}")
def get_route(
    req: Request,
    route_id: int,
    include: Annotated[list[str] | None, Query()] = None,
):
    """
    Gets the route with the specified ID.
    """

    include_set = process_include(include, INCLUDES)
    with req.app.state.db.session() as session:
        route = session.query(Route).filter(Route.id == route_id).first()
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")

        route_json = {FIELD_ID: route.id, FIELD_NAME: route.name}

        # Add related values to the route if included
        if FIELD_STOP_IDS in include_set:
            route_json[FIELD_STOP_IDS] = query_route_stop_ids(route.id, session)

        if FIELD_WAYPOINTS in include_set:
            route_json[FIELD_WAYPOINTS] = query_route_waypoints(route.id, session)

        if FIELD_IS_ACTIVE in include_set:
            alert = get_current_alert(datetime.now(timezone.utc), session)
            route_json[FIELD_IS_ACTIVE] = is_route_active(route.id, alert, session)

        return route_json


def query_route_stop_ids(route_id: int, session):
    """
    Queries and returns the stop IDs for the given route ID.
    """

    stops = (
        session.query(RouteStop)
        .order_by(RouteStop.position)
        .filter(route_id == Route.id)
        .with_entities(RouteStop.stop_id)
        .all()
    )
    return [stop_id for (stop_id,) in stops]


def query_route_waypoints(route_id: int, session):
    """
    Queries and returns the JSON representation of the waypoints for the given route ID.
    """

    waypoints = session.query(Waypoint).filter(route_id == Waypoint.route_id).all()
    return [
        {FIELD_LATITUDE: waypoint.lat, FIELD_LONGITUDE: waypoint.lon}
        for waypoint in waypoints
    ]


def get_current_alert(now: datetime, session) -> Optional[Alert]:
    """
    Queries and returns the current alert, if any, that is active at the given time.
    """

    return (
        session.query(Alert)
        .filter(Alert.start_datetime <= now, Alert.end_datetime >= now)
        .first()
    )


def is_route_active(route_id: int, alert: Optional[Alert], session) -> bool:
    """
    Queries and returns whether the frontend is currently active, i.e
    not disabled by the current alert.
    """

    if not alert:
        # No alert, should be active
        return True

    # If the route is disabled by the current alert, then it is not active.
    enabled = (
        session.query(RouteDisable)
        .filter(
            RouteDisable.alert_id == alert.id,
            RouteDisable.route_id == route_id,
        )
        .count()
    ) == 0

    return enabled


@router.post("/")
async def create_route(
    req: Request, name: str = Form(...), kml: Optional[UploadFile] = File(None)
):
    """
    Creates a new route.
    """

    with req.app.state.db.session() as session:
        route = Route(name=name)
        session.add(route)
        session.commit()

        if kml:
            contents = await kml.read()

            latlons = kml_to_waypoints(contents)[:-1]

            for latlon in latlons:
                print(latlon)
                waypoint = Waypoint(route_id=route.id, lat=latlon[0], lon=latlon[1])
                session.add(waypoint)

            await kml.close()

            session.commit()

    return JSONResponse(status_code=200, content={"message": "OK"})


@router.put("/{route_id}")
async def patch_route(
    req: Request,
    route_id: int,
    name: str = Form(None),
    kml: Optional[UploadFile] = File(None),
):
    """
    Updates the name of the route with the specified ID.
    """
    if not name and not kml:
        raise HTTPException(status_code=400, detail="No name or KML file provided")

    with req.app.state.db.session() as session:
        if name:
            route = session.query(Route).filter(Route.id == route_id).first()
            if not route:
                raise HTTPException(status_code=404, detail="Route not found")

            route.name = name
            session.commit()

        if kml:
            waypoints = (
                session.query(Waypoint).filter(Waypoint.route_id == route_id).all()
            )
            for waypoint in waypoints:
                session.delete(waypoint)
            session.commit()

            contents = await kml.read()

            latlons = kml_to_waypoints(contents)[:-1]

            for latlon in latlons:
                waypoint = Waypoint(route_id=route_id, lat=latlon[0], lon=latlon[1])
                session.add(waypoint)

            session.commit()

    return JSONResponse(status_code=200, content={"message": "OK"})


def kml_to_waypoints(contents: bytes):
    """
    Converts a KML file to a list of waypoints.
    """

    str_contents = contents.decode("utf-8").replace("\n", "").replace("\t", "")

    regex = r"<coordinates>(.*)</coordinates>"

    matches = re.findall(regex, str_contents)

    m = matches[0].strip().split(" ")
    trios = [i.split(",") for i in m]
    latlons = [[float(i[1]), float(i[0])] for i in trios]

    return latlons


@router.delete("/{route_id}")
def delete_route(req: Request, route_id: int):
    """
    Deletes the route with the specified ID.
    """

    with req.app.state.db.session() as session:
        route = session.query(Route).filter(Route.id == route_id).first()
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")

        session.delete(route)
        session.commit()

    return JSONResponse(status_code=200, content={"message": "OK"})


class RouteStopModel(BaseModel):
    """
    Represents a route stop.
    """

    stop_id: int


@router.get("/{route_id}/stops")
def get_route_stops(req: Request, route_id: int):
    """
    Gets all stops for the specified route.
    """

    with req.app.state.db.session() as session:
        stops = (
            session.query(RouteStop)
            .filter(RouteStop.route_id == route_id)
            .with_entities(RouteStop.stop_id)
            .all()
        )

        return [stop_id for (stop_id,) in stops]


@router.post("/{route_id}/stops")
def create_route_stop(req: Request, route_id: int, route_stop_model: RouteStopModel):
    """
    Creates a new route stop.
    """

    with req.app.state.db.session() as session:
        route_stop = RouteStop(route_id=route_id, stop_id=route_stop_model.stop_id)
        session.add(route_stop)
        session.commit()

    return JSONResponse(status_code=200, content={"message": "OK"})


@router.delete("/{route_id}/stops")
def delete_route_stop(req: Request, route_id: int, route_stop_model: RouteStopModel):
    """
    Deletes a route stop.
    """

    with req.app.state.db.session() as session:
        route_stop = (
            session.query(RouteStop)
            .filter(
                RouteStop.route_id == route_id,
                RouteStop.stop_id == route_stop_model.stop_id,
            )
            .first()
        )
        if not route_stop:
            raise HTTPException(status_code=404, detail="Route stop not found")

        session.delete(route_stop)
        session.commit()

    return JSONResponse(status_code=200, content={"message": "OK"})
