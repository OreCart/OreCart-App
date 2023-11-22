"""
Contains routes specific to working with routes.
"""

from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from src.model.alert import Alert
from src.model.route import Route
from src.model.route_disable import RouteDisable
from src.model.route_stop import RouteStop
from src.model.waypoint import Waypoint
from src.request import validate_include

# JSON field names/include values
FIELD_ID = "id"
FIELD_NAME = "name"
FIELD_STOP_IDS = "stopIds"
FIELD_WAYPOINTS = "waypoints"
FIELD_IS_ACTIVE = "isActive"
FIELD_LATITUDE = "latitude"
FIELD_LONGITUDE = "longitude"
INCLUDES = {
    FIELD_NAME,
    FIELD_STOP_IDS,
    FIELD_WAYPOINTS,
    FIELD_IS_ACTIVE,
}

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("/")
def get_all_routes(
    req: Request,
    include: Annotated[list[str] | None, Query()] = None,
):
    """
    Gets all routes.
    """
    return get_route_impl(req, None, include)


@router.get("/{route_id}")
def get_route_with_id(
    req: Request,
    route_id: int,
    include: Annotated[list[str] | None, Query()] = None,
):
    """
    Gets the route with the specified ID.
    """
    return get_route_impl(req, route_id, include)


def get_route_impl(
    req: Request,
    route_id: Optional[int],
    include: Annotated[list[str] | None, Query()] = None,
):
    """
    Shared implemntation of the GET /routes endpoints.
    """
    include_set = INCLUDES
    if include:
        include_set = validate_include(include, INCLUDES)

    with req.app.state.db.session() as session:
        return query_routes(route_id, include_set, session)


def query_routes(
    route_id: Optional[int], include_set: set[str], session
) -> list[dict] | dict:
    """
    Gets route information and returns it in the format expected by the client,
    given the specified include parameters.
    """

    route_query = session.query(Route)

    # Filter to the ID if specified, otherwise just query for all routes
    if route_id is not None:
        route_query = route_query.filter(Route.id == route_id)

    if FIELD_NAME in include_set:
        # Name desired, just do a normal query.
        routes = [
            {FIELD_ID: route.id, FIELD_NAME: route.name} for route in route_query.all()
        ]
    else:
        # Name not desired, remove it. Note that reducing this to just the ID results
        # in a tuple we need to unpack.
        route_query = route_query.with_entities(Route.id)
        routes = [{FIELD_ID: route_id} for (route_id,) in route_query.all()]

    if len(routes) == 0:
        raise HTTPException(status_code=404, detail="Route not found")

    for route in routes:
        # Query for and add any desired optional values to be included.
        if FIELD_STOP_IDS in include_set:
            route[FIELD_STOP_IDS] = query_route_stop_ids(route[FIELD_ID], session)

        if FIELD_WAYPOINTS in include_set:
            route[FIELD_WAYPOINTS] = query_route_waypoints(route[FIELD_ID], session)

        if FIELD_IS_ACTIVE in include_set:
            route[FIELD_IS_ACTIVE] = is_route_active(route[FIELD_ID], session)

    return routes


def query_route_stop_ids(route_id: int, session):
    """
    Queries and returns the stop IDs for the given route ID.
    """

    stops = (
        session.query(RouteStop)
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


def is_route_active(route_id: int, session) -> bool:
    """
    Queries and returns whether the frontend is currently active, i.e
    not disabled by the current alert.
    """

    # Convert to UTC then drop the timezone so we can use it in the DB, which has
    # UTC timestamps without timezone information.
    now = datetime.now(tz=timezone.utc).replace(tzinfo=None)

    alert = (
        session.query(Alert)
        .filter(Alert.start_datetime <= now, Alert.end_datetime >= now)
        .params(now=now)
        .first()
    )

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
