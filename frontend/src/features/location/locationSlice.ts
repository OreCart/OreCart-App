import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "../../common/hooks";
import { error, loading, success, type Query } from "../../common/query";

/**
 * Implementation of latitude/longitude-based coordinates independent from any particular
 * mapping library.
 */
export interface Coordinate {
  latitude: number;
  longitude: number;
}

interface LocationState {
  status: Query<Coordinate>;
}

const initialState: LocationState = {
  status: loading(),
};

/*
 * This slice holds the current location status. Unlike the other RTK Query
 * slices, this has internal state that we must work with. You can think of
 * it as just a dumb holder of the current location. Everything else is managed
 * by the "companion" middleware that is in the other file in this package.
 * That does most of the work on tracking the location, and then just updates
 * the state value in this.
 */
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    updateLocationStatus: (state, action: PayloadAction<Query<Coordinate>>) => {
      state.status = action.payload;
    },
  },
});

/**
 * Hook for querying the current location. Will be undefined if not currently
 * available.
 */
export const useLocation = (): Query<Coordinate> =>
  useAppSelector((state) => state.location.status);
export interface Closest<T> {
  value: T;
  distance: number;
}

/**
 * Use the closest coordinate from a list of objects that are coordinates. Will return
 * an error if the location is not available, or if there is no data given.
 */
export const useClosest = <T extends Coordinate>(
  of: T[],
): Query<Closest<T>> => {
  const location = useLocation();
  if (!location.isSuccess) {
    return location;
  }

  const closest = of.reduce<Closest<T> | undefined>(
    (acc: Closest<T> | undefined, cur: T) => {
      const distance = Math.sqrt(
        Math.pow(cur.latitude - location.data.latitude, 2) +
          Math.pow(cur.longitude - location.data.longitude, 2),
      );
      if (acc === undefined || distance < acc.distance) {
        return { value: cur, distance };
      }
      return acc;
    },
    undefined,
  );

  if (closest === undefined) {
    return error("No closest found");
  }

  return success(closest);
};

export const useClosestQuery = <T extends Coordinate>(
  of: Query<T[]>,
): Query<Closest<T>> => {
  const location = useLocation();
  if (!location.isSuccess) {
    return location;
  }

  if (!of.isSuccess) {
    return of;
  }

  const closest = of.data.reduce<Closest<T> | undefined>(
    (acc: Closest<T> | undefined, cur: T) => {
      const distance = Math.sqrt(
        Math.pow(cur.latitude - location.data.latitude, 2) +
          Math.pow(cur.longitude - location.data.longitude, 2),
      );
      if (acc === undefined || distance < acc.distance) {
        return { value: cur, distance };
      }
      return acc;
    },
    undefined,
  );

  if (closest === undefined) {
    return error("No closest found");
  }

  return success(closest);
};

/**
 * Use the distance of the coordinate-line object from the current location. Will return
 * an error if the location is not available.
 */
export const useDistance = <T extends Coordinate>(at: T): Query<number> => {
  const location = useLocation();
  if (!location.isSuccess) {
    return location;
  }

  const distance = Math.sqrt(
    Math.pow(at.latitude - location.data.latitude, 2) +
      Math.pow(at.longitude - location.data.longitude, 2),
  );

  return success(distance);
};

export const { updateLocationStatus } = locationSlice.actions;

export default locationSlice.reducer;
