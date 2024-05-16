from typing import Optional

from src.db.stop import StopModel
from src.vantracking.cache import VanStateCache
from src.vantracking.state import Location


class MemcachedVanStateCache(VanStateCache):
    def __init__(self, config={}):
        raise NotImplementedError()

    def __contains__(self, van_id: int):
        raise NotImplementedError()

    def add(self, van_id: int, stops: list[StopModel]):
        raise NotImplementedError()

    def get_locations(self, van_id: int) -> list[Location]:
        raise NotImplementedError()

    def push_location(self, van_id: int, location: Location):
        raise NotImplementedError()

    def get_stops(self, van_id: int) -> list[StopModel]:
        raise NotImplementedError()

    def get_current_stop_index(self, van_id: int) -> int:
        raise NotImplementedError()

    def set_current_stop_index(self, van_id: int, index: int):
        raise NotImplementedError()
