from datetime import datetime

from pydantic import BaseModel


class Van(BaseModel):
    """
    A model for the request body to make a new van or update a van
    """

    route_id: int
    guid: str


class VanLocation(BaseModel):
    """
    A model for the request body to make a new van or update a van
    """

    timestamp: datetime
    latitude: float
    longitude: float
