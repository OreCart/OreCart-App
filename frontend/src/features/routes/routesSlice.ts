import apiSlice from "../../app/apiSlice";
import { type Coordinate } from "../location/locationSlice";
import { type Stop } from "../stops/stopsSlice";

/**
 * Minimum information sent by the server about a route.
 */
export interface Route {
  /** The id of the route. */
  id: number;
  /** The name of the route. */
  name: string;
  /** Whether the route is currently active or has an outage. */
  isActive: boolean;
  /** The color of the route. */
  color: string;
}

/**
 * A route with waypoints.
 */
export interface WaypointRoute extends Route {
  /** The coordinates outlining the path of the route. */
  waypoints: Coordinate[];
}

/**
 * A route with child stops.
 */
export interface ParentRoute extends WaypointRoute {
  /** The stops of the route. */
  stops: Stop[];
  /** The description of the route (i.e where it goes). */
  description: string;
}

// --- API Definition ---

/**
 * This slice extends the existing API slice with the route information route.
 * There should be no state to reason about here, it's just configuration.
 */
const routesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    getRoutes: builder.query<WaypointRoute[], void>({
      query: () => "/routes/?include=stops&include=waypoints&include=isActive",
      providesTags: ["Routes"],
    }),
    getRoute: builder.query<ParentRoute, number>({
      query: (id) =>
        `/routes/${id}?include=stops&include=waypoints&include=isActive`,
      providesTags: (_, __, id) => [{ type: "Route", id }],
    }),
  }),
});

/**
 * Hook for querying the list of routes.
 */
export const { useGetRoutesQuery, useGetRouteQuery } = routesApiSlice;
