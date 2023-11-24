"""
Contains routes specific to working with routes.
"""

from datetime import datetime, timezone
from typing import Annotated, Any, Iterator, Optional

from fastapi import APIRouter, HTTPException, Query, Request
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
    FIELD_NAME,
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
        query = session.query(Route)
        query, entities = apply_includes_to_query(query, include_set)

        # Be more efficient and load the current alert only once if
        # we need it for the isActive field.
        alert = None
        if FIELD_IS_ACTIVE in include_set:
            alert = get_current_alert(
                datetime.now(timezone.utc).replace(tzinfo=None), session
            )

        routes = []
        for route in query.all():
            route = unpack_entity_tuple(route, entities)

            # Add related values to the route if included
            if FIELD_STOP_IDS in include_set:
                route[FIELD_STOP_IDS] = query_route_stop_ids(route[FIELD_ID], session)

            if FIELD_WAYPOINTS in include_set:
                route[FIELD_WAYPOINTS] = query_route_waypoints(route[FIELD_ID], session)

            # Already checked if included later when we fetched the alert, check for it's
            # presence.
            if alert:
                route[FIELD_IS_ACTIVE] = is_route_active(
                    route[FIELD_ID], alert, session
                )

            routes.append(route)

        return routes


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
        query = session.query(Route).filter(Route.id == route_id)
        query, entities = apply_includes_to_query(query, include_set)
        route = query.first()
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")

        route = unpack_entity_tuple(route, entities)

        # Add related values to the route if included
        if FIELD_STOP_IDS in include_set:
            route[FIELD_STOP_IDS] = query_route_stop_ids(route[FIELD_ID], session)

        if FIELD_WAYPOINTS in include_set:
            route[FIELD_WAYPOINTS] = query_route_waypoints(route[FIELD_ID], session)

        if FIELD_IS_ACTIVE in include_set:
            alert = get_current_alert(
                datetime.now(timezone.utc).replace(tzinfo=None), session
            )
            route[FIELD_IS_ACTIVE] = is_route_active(route[FIELD_ID], alert, session)

        return route


def apply_includes_to_query(query, include_set) -> tuple[Any, Iterator[str]]:
    """
    Applies the given include parameters to the given query, reducing the query to only
    the fields that are desired. Since this will cause the query to return a tuple, a
    dictionary is also provided of the names for each value that will appear in the tuple
    in-order. This can be used with unpack_stop_values can be used to turn the tuple into
    a JSON structure.
    """

    entities: dict[str, Any] = {FIELD_ID: Route.id}
    if FIELD_NAME in include_set:
        entities[FIELD_NAME] = Route.name

    return (query.with_entities(*entities.values()), iter(entities.keys()))


def unpack_entity_tuple(result: tuple, entities: Iterator[str]) -> dict:
    """
    Given a tuple of values and a list of the names for each value, returns a dictionary
    mapping each name to its corresponding value.
    """
    return {key: value for key, value in zip(entities, result)}


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