from datetime import timedelta

from src.db.stop import StopModel
from src.vantracking.location import Location


class VanState:
    def __init__(
        self, location: Location, stop: StopModel, seconds_to_next_stop: timedelta
    ):
        self.location = location
        self.next_stop = stop
        self.seconds_to_next_stop = seconds_to_next_stop
