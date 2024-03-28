import apiSlice from "../../app/apiSlice";
import { type Coordinate } from "../location/locationSlice";
import { type Route } from "../routes/routesSlice";

/**
 * A stop containing all of the common information returned by the API.
 */
export interface Stop extends Coordinate {
  /** The ID of the stop. */
  id: number;
  /** The name of the stop. */
  name: string;
  /** Whether the stop is currently active or has an outage. */
  isActive: boolean;
}

/**
 * A stop with the colors of the routes it is on.
 */
export interface ColorStop extends Stop {
  /** The colors of the Stop, derived from the route colors. */
  colors: string[];
}

/**
 * A stop with the routes it is on.
 */
export interface ParentStop extends Stop {
  /** The routes this stop is on. */
  routes: Route[];
}

// --- API Definition ---

/**
 * This slice extends the existing API slice with the stop information routes.
 * There should be no state to reason about here, it's just configuration.
 */
const stopsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    getStops: builder.query<ColorStop[], void>({
      query: () => "/stops/?include=colors&include=isActive",
      providesTags: ["Stops"],
    }),
    getStop: builder.query<ParentStop, number>({
      query: (id) => `/stops/${id}?include=routes&include=isActive`,
      providesTags: (_, __, id) => [{ type: "Stop", id }],
    }),
  }),
});

/**
 * Hook for querying the list of stops.
  | GenericPerspective
 */
export const { useGetStopsQuery, useGetStopQuery } = stopsApiSlice;
