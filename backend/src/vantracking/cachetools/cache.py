import time
from collections import deque
from typing import Any, Optional

from cachetools import FIFOCache
from src.db.stop import StopModel
from src.vantracking.cache import VanStateCache
from src.vantracking.cachetools.ttl import TTL
from src.vantracking.cachetools.ttlqueue import TTLQueue
from src.vantracking.cachetools.ttlvanstate import TTLVanState
from src.vantracking.state import Location


class CachetoolsVanStateCache(VanStateCache):
    """
    A van state cache implementation that uses the cachetools library and some custom caches
    to implement the required functionality.
    """

    def __init__(self, config={}):
        if "maxsize" not in config:
            config["maxsize"] = 100
        if "ttl" not in config:
            config["ttl"] = 300
        self.ttl = int(config["ttl"])
        # TTLCache cannot be used since it only renews items when they are reassigned. We as a
        # result only want to guard against the cache being too full, hence the usage of a more
        # basic FIFO cache.
        self.cache = FIFOCache(maxsize=int(config["maxsize"]))

    def __contains__(self, van_id: int):
        return van_id in self.cache

    def add(self, van_id: int, stops: list[StopModel]):
        # Remove van states that haven't been updated in a while while we can safely mutate
        # the cache.
        self.__expire()
        self.cache[van_id] = TTL(
            TTLVanState(
                locations=TTLQueue(ttl=self.ttl),
                stops=stops,
                current_stop_index=-1,
            )
        )

    def get_locations(self, van_id: int) -> list[Location]:
        entry = self.cache.get(van_id)
        if entry is None:
            raise KeyError("Van state does not exist")
        # We aren't working with a location list, must convert it first.
        return list(iter(entry.value.locations))

    def push_location(self, van_id: int, location: Location):
        # Remove van states that haven't been updated in a while while we can safely mutate
        # the cache.
        self.__expire()
        entry = self.cache[van_id]
        if entry is None:
            raise KeyError("Van state does not exist")
        entry.value.locations.push(location)
        # This van state is still being updated by something, so we should extend its lifespan.
        entry.refresh()

    def get_stops(self, van_id: int) -> list[StopModel]:
        entry = self.cache.get(van_id)
        if entry is None:
            raise KeyError("Van state does not exist")
        return entry.value.stops

    def get_current_stop_index(self, van_id: int) -> int:
        entry = self.cache.get(van_id)
        if entry is None:
            raise KeyError("Van state does not exist")
        return entry.value.current_stop_index

    def set_current_stop_index(self, van_id: int, index: int):
        # Remove van states that haven't been updated in a while while we can safely mutate
        # the cache.
        self.__expire()
        entry = self.cache[van_id]
        if entry is None:
            raise KeyError("Van state does not exist")
        entry.value.current_stop_index = index
        # This van state is still being updated by something, so we should extend its lifespan.
        entry.refresh()

    def __expire(self):
        for van_id, state in self.cache.items():
            if state.expired(self.ttl):
                del self.cache[van_id]
