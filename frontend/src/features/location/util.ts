import { type Coordinate } from "./locationSlice";

/**
 * A coordinate and its distance from a target coordinate.
 * @see closest
 */
interface ClosestCoordinate<O extends Coordinate> {
  inner: O;
  distance: number;
}

/**
 * Finds the closest coordinate out of the given list to the given target coordinate.
 * @param ofAll The list of coordinates to search.
 * @param to The target coordinate.
 * @returns The closest coordinate, or undefined if the list is empty.
 */
export function closest<O extends Coordinate, T extends Coordinate>(
  ofAll: O[],
  to: T,
): ClosestCoordinate<O> | undefined {
  if (ofAll.length === 0) {
    return undefined;
  }

  const closest: ClosestCoordinate<O> = {
    inner: ofAll[0],
    distance: distance(ofAll[0], to),
  };

  for (const o of ofAll) {
    const d = distance(o, to);
    if (d < closest.distance) {
      closest.inner = o;
      closest.distance = d;
    }
  }

  return closest;
}

/**
 * Simple pythagorean distance between two coordinates.
 * @param a The first coordinate.
 * @param b The second coordinate.
 * @returns The distance between the two coordinates. Note that this is in lat-lon distance,
 * so you will need to convert it with geoDistanceToMiles() to get a human-readable miles
 * result.
 */
export function distance(a: Coordinate, b: Coordinate): number {
  const latDiff = a.latitude - b.latitude;
  const lonDiff = a.longitude - b.longitude;
  return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
}

/**
 * Converts a lat-lon distance to miles.
 * @param distance The distance in lat-lon units.
 * @returns The distance in miles.
 */
export function geoDistanceToMiles(distance: number): number {
  return distance * 69.0;
}

/**
 * Formats a miles distance in human-readable format.
 * @param distance The distance in miles.
 * @returns The distance in human-readable format.
 */
export function formatMiles(distance: number): string {
  if (distance < 0.1) {
    return `<0.1 mi`;
  } else {
    return `${distance.toFixed(1)} mi`;
  }
}

/**
 * Formats a seconds time in human-readable format.
 * @param seconds The time in seconds.
 * @returns The time in human-readable format.
 */
export const formatSecondsAsMinutes = (seconds: number): string => {
  if (seconds < 60) {
    return `<1 min`;
  } else {
    return `${Math.round(seconds / 60)} min`;
  }
};
