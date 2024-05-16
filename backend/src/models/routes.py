from pydantic import BaseModel


class Route(BaseModel):
    name: str
    color: str
    description: int


class RouteStop(BaseModel):
    """
    Represents a route stop.
    """

    stop_id: int
