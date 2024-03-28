import apiSlice from "../../app/apiSlice";

/**
 * A list of alerts, as defined by the backend.
 */
export type Alerts = Alert[];

/**
 * An alert, as defined by the backend.
 */
export interface Alert {
  id: number;
  text: string;
  startDateTime: number;
  endDateTime: number;
}

// --- API Definition ---

/**
 * This slice extends the existing API slice with the alert information route.
 * There should be no state to reason about here, it's just configuration.
 */
const alertsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    getActiveAlerts: builder.query<Alerts, void>({
      query: () => "/alerts/?filter=active",
      providesTags: ["ActiveAlerts"],
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    getFutureAlerts: builder.query<Alerts, void>({
      query: () => "/alerts/?filter=future",
      providesTags: ["FutureAlerts"],
    }),
  }),
});

export const { useGetActiveAlertsQuery, useGetFutureAlertsQuery } =
  alertsApiSlice;
