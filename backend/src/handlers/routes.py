"""
Contains routes specific to working with routes.
"""

import base64
import re
from datetime import datetime, timezone
from typing import Annotated, Optional

import pygeoif
from bs4 import BeautifulSoup  # type: ignore
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from fastapi.responses import JSONResponse
from fastkml import kml
from fastkml.styles import LineStyle, PolyStyle
from pydantic import BaseModel
from pygeoif.geometry import Point, Polygon
from src.auth.make_async import make_async
from src.auth.user_manager import current_user
from src.model.alert import Alert
from src.model.route import Route
from src.model.route_disable import RouteDisable
from src.model.route_stop import RouteStop
from src.model.stop import Stop
from src.model.user import User
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
@make_async
def get_routes(
    req: Request,
    include: Annotated[list[str] | None, Query()] = None,
):
    """
    Gets all routes.
    """
    session = req.state.session

    include_set = process_include(include, INCLUDES)
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


@router.get("/kmlfile")
@make_async
def get_kml(req: Request):
    """
    Gets the KML file for all routes.
    """
    session = req.state.session

    routes = session.query(Route).all()
    stops = session.query(Stop).all()
    route_stops = session.query(RouteStop).all()

    k = kml.KML()
    ns = "{http://www.opengis.net/kml/2.2}"
    d = kml.Document(ns, "3.14", "Routes", "Routes for the OreCart app.")
    k.append(d)

    for route in routes:
        stop_ids = [
            route_stop.stop_id
            for route_stop in route_stops
            if route_stop.route_id == route.id
        ]
        stop_divs = "".join(
            [f"<div>{route.name}<br></div>" for route in routes if route.id in stop_ids]
        )

        description = f"<![CDATA[{stop_divs}]]>"

        style = kml.Style(id="route-outline")
        style.append_style(
            LineStyle(color="#00" + route.color[1:], width=2)
        )  # Red outline in AABBGGRR hex format
        style.append_style(PolyStyle(fill=0))  # No fill
        p = kml.Placemark(
            ns=ns,
            id=route.name,
            name=route.name,
            description=description,
            styles=[style],
        )
        p.geometry = Polygon([(w.lon, w.lat, 0) for w in route.waypoints])

        p.append_style(style)
        p.styleUrl = "#route-outline"

        d.append(p)

    for stop in stops:
        p = kml.Placemark(ns, stop.name, stop.name)
        p.geometry = Point(stop.lon, stop.lat)
        d.append(p)

    d.append_style(style)

    kml_string = k.to_string().replace("&lt;", "<").replace("&gt;", ">")

    kml_string_bytes = kml_string.encode("ascii")
    base64_kml_string = base64.b64encode(kml_string_bytes).decode("ascii")

    # return kml_string

    return {"base64": base64_kml_string}


@router.get("/{route_id}")
@make_async
def get_route(
    req: Request,
    route_id: int,
    include: Annotated[list[str] | None, Query()] = None,
):
    """
    Gets the route with the specified ID.
    """
    session = req.state.session

    include_set = process_include(include, INCLUDES)
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
    waypoints = [waypoint for waypoint in waypoints]
    waypoints.append(waypoints[0])
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
    req: Request, kml_file: UploadFile, user: Annotated[User, Depends(current_user)]
):
    """
    Creates a new route.
    """

    async with req.app.state.db.async_session() as asession:
        contents: bytes = await kml_file.read()

        contents = contents.decode("utf-8").encode("ascii")

        routes = {}
        stops = {}

        stop_id_map = {}

        k = kml.KML()
        k.from_string(contents)

        for feature_list in k.features():
            for feature in feature_list.features():
                if type(feature.geometry) == pygeoif.geometry.Polygon:
                    routes[feature.name] = feature
                elif type(feature.geometry) == pygeoif.geometry.Point:
                    stops[feature.name] = feature
                else:
                    return HTTPException(status_code=400, detail="bad kml file")

        for stop_name, stop in stops.items():
            stop_model = Stop(
                name=stop_name, lat=stop.geometry.y, lon=stop.geometry.x, active=True
            )
            asession.add(stop_model)
            await asession.flush()
            stop_id_map[stop_name] = stop_model.id

        for route_name, route in routes.items():
            # Get polygon color
            color = "#000000"
            for style in route.styles():
                if isinstance(style, PolyStyle):
                    color = style.color
                    break
            route_model = Route(name=route_name, color=color)
            asession.add(route_model)
            await asession.flush()

            added = set()

            for i, coords in enumerate(route.geometry.exterior.coords):
                # Ignore dupes except for the last one that completes the polygon
                if coords in added and i != len(route.geometry.exterior.coords) - 1:
                    print(f"skipping duplicate {coords}")
                    continue
                print(f"adding {coords}")
                added.add(coords)
                waypoint = Waypoint(
                    route_id=route_model.id, lat=coords[1], lon=coords[0]
                )
                asession.add(waypoint)
                await asession.flush()

            route_desc_html = BeautifulSoup(route.description, features="html.parser")

            # Want the text contents of all of the surface-level divs and then strip
            # all of the tags of it's content

            route_stops = [
                div.text.strip()
                for div in route_desc_html.find_all("div", recursive=False)
            ]

            print(route_stops, route_desc_html.find_all("div", recursive=False))

            for pos, stop in enumerate(route_stops):
                if stop not in stop_id_map:
                    continue
                stop_id = stop_id_map[stop]
                route_stop = RouteStop(
                    route_id=route_model.id, stop_id=stop_id, position=pos
                )
                asession.add(route_stop)
                await asession.flush()

        await kml_file.close()

        await asession.commit()

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


@router.delete("/")
@make_async
def delete_route(req: Request, user: Annotated[User, Depends(current_user)]):
    """
    Deletes everything in Routes, Waypoint, Stops, and Route-Stop.
    """
    session = req.state.session

    session.query(Route).delete()
    session.query(Waypoint).delete()
    session.query(Stop).delete()
    session.query(RouteStop).delete()
    session.commit()

    return JSONResponse(status_code=200, content={"message": "OK"})


class RouteStopModel(BaseModel):
    """
    Represents a route stop.
    """

    stop_id: int


@router.get("/{route_id}/stops")
@make_async
def get_route_stops(req: Request, route_id: int):
    """
    Gets all stops for the specified route.
    """
    session = req.state.session

    stops = (
        session.query(Stop, RouteStop)
        .filter(RouteStop.route_id == route_id)
        .with_entities(RouteStop.stop_id, Stop.name)
        .all()
    )
    return [(stop_id, name) for (stop_id, name) in stops]
