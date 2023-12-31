import apiSlice from "../../app/apiSlice";
import { type Coordinate } from "../location/locationSlice";

/**
 * A list of routes, as defined by the backend.
 */
export type Routes = Route[];

/**
 * A Route, as defined by the backend.
 */
export interface Route {
  id: number;
  name: string;
  stopIds: number[];
  waypoints: Coordinate[];
  isActive: boolean;
}

// --- API Definition ---

/**
 * This slice extends the existing API slice with the route information route.
 * There should be no state to reason about here, it's just configuration.
 */
const routesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    getRoutes: builder.query<Routes, void>({
      query: () =>
        "/routes/?include=stopIds&include=waypoints&include=isActive",
      providesTags: ["Routes"],
    }),
  }),
});

/**
 * Hook for querying the list of routes.
 */
export const { useGetRoutesQuery } = routesApiSlice;
