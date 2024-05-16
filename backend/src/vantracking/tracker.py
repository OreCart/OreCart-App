from datetime import datetime, timedelta
from math import cos, radians, sqrt
from typing import Optional

from src.db.stop import StopModel
from src.vantracking.cache import VanStateCache
from src.vantracking.coordinate import Coordinate
from src.vantracking.location import Location
from src.vantracking.state import VanState

THRESHOLD_RADIUS_M = 30.48  # 100 ft
THRESHOLD_TIME = timedelta(seconds=30)
AVERAGE_VAN_SPEED_MPS = 8.9408  # 20 mph


class VanTracker:
    """
    General class for managing the current location and time estimates of all vans. This is transient state,
    hence why it's kept separate from the stateless route handlers and database. Create an instance with
    factory.van_tracker().
    """

    def __init__(self, cache: VanStateCache):
        self.cache = cache

    def __contains__(self, van_id: int):
        return van_id in self.cache

    def init_van(self, van_id: int, stops: list[StopModel]):
        """
        Initialize a van state tied to the van ID. The stop list will be used for time estimates, so it should be in the
        exact order the van will visit each stop. The van state must be consistently updated with push_location or it
        will be removed from the cache.
        """
        self.cache.add(van_id, stops)

    def get_van(self, van_id: int) -> Optional[VanState]:
        """
        Get the current van state tied to the van ID (if it exists). This will return None if the van state is not
        in the cache.
        """

        if van_id not in self.cache:
            return None
        locations = self.cache.get_locations(van_id)
        if not locations:
            return None
        # Only expose the first location for simplicity.
        location = locations[-1]
        stops = self.cache.get_stops(van_id)
        current_stop_index = self.cache.get_current_stop_index(van_id)
        # Assuming that the route loops, find the next stop this van is assumed to be going to. This is what
        # we will estimate the time to.
        next_stop = stops[(current_stop_index + 1) % len(stops)]
        next_stop_distance_meters = _distance_meters(
            location.coordinate,
            Coordinate(latitude=next_stop.lat, longitude=next_stop.lon),
        )
        # Don't be fancy, just divide the difference in distance by the (guessed) average speed of the van.
        time_to = timedelta(seconds=next_stop_distance_meters / AVERAGE_VAN_SPEED_MPS)
        return VanState(location=location, stop=next_stop, seconds_to_next_stop=time_to)

    def push_location(self, van_id: int, location: Location):
        """
        Push a new location to the van state tied to the van ID (if it exists). This will extend the lifespan of the van
        state in the cache. This will also update the current stop and time estimate of the van as needed.
        """

        if van_id not in self.cache:
            return None
        self.cache.push_location(van_id, location)

        # To find an accurate time estimate for a stop, we need to remove vans that are not arriving at a stop, either
        # because they aren't arriving at the stop or because they have departed it. We achieve this currently by
        # implementing a state machine that tracks the (guessed) current stop of each van. We can then use that to find
        # the next logical stop and estimate the time to arrive to that.

        stops = self.cache.get_stops(van_id)
        current_stop_index = self.cache.get_current_stop_index(van_id)
        # We want to consider all of the stops that are coming up for this van, as that allows to handle cases where a
        # stop is erroneously skipped. Also make sure we include subsequent stops that wrap around. The wrap around slice
        # needs to be bounded to 0 to prevent a negative index causing weird slicing behavior.
        subsequent_stops = (
            stops[current_stop_index + 1 :] + stops[: max(current_stop_index - 1, 0)]
        )
        locations = self.cache.get_locations(van_id)
        for i, stop in enumerate(subsequent_stops):
            longest_subset: list[datetime] = []
            current_subset: list[datetime] = []

            # Find the longest consequtive subset (i.e streak) where the distance of the past couple of
            # van locations is consistently within this stop's radius.
            for location in locations:
                stop_distance_meters = _distance_meters(
                    location.coordinate,
                    Coordinate(latitude=stop.lat, longitude=stop.lon),
                )
                if stop_distance_meters < THRESHOLD_RADIUS_M:
                    current_subset.append(location.timestamp)
                else:
                    if len(current_subset) > len(longest_subset):
                        longest_subset = current_subset
                    current_subset = []
            if len(current_subset) > len(longest_subset):
                longest_subset = current_subset

            if longest_subset:
                # A streak exists, find the overall duration that this van was within the stop's radius. Since locations
                # are ordered from oldest to newest, we can just subtract the first and last timestamps.
                duration = longest_subset[-1] - longest_subset[0]
            else:
                # No streak, so we weren't at the stop for any amount of time.
                duration = timedelta(seconds=0)

            if duration >= THRESHOLD_TIME:
                # We were at this stop for long enough, move to it. Since the stops iterated through are relative to the
                # current stop, we have to add the current stop index to the current index in the loop to get the actual
                # stop index.
                # Note: It's possible that the van was at another stop's radius for even longer, but this is not considered
                # until real-world testing shows this edge case to be important.
                self.cache.set_current_stop_index(
                    van_id, (current_stop_index + i + 1) % len(stops)
                )
                break


KM_LAT_RATIO = 111.32  # km/degree latitude
EARTH_CIRCUFERENCE_KM = 40075  # km
DEGREES_IN_CIRCLE = 360  # degrees


def _distance_meters(a: Coordinate, b: Coordinate) -> float:
    dlat = b.latitude - a.latitude
    dlon = b.longitude - a.longitude

    # Simplified distance calculation that assumes the earth is a sphere. This is good enough for our purposes.
    # https://stackoverflow.com/a/39540339
    dlatkm = dlat * KM_LAT_RATIO
    dlonkm = dlon * EARTH_CIRCUFERENCE_KM * cos(radians(a.latitude)) / DEGREES_IN_CIRCLE

    return sqrt(dlatkm**2 + dlonkm**2) * 1000
