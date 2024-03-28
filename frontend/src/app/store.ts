import { configureStore } from "@reduxjs/toolkit";

import locationMiddleware from "../features/location/locationMiddleware";
import locationReducer from "../features/location/locationSlice";
import { mapSlice } from "../features/map/mapSlice";
import { arrivalsSlice } from "../features/vans/arrivalSlice";

import apiSlice from "./apiSlice";

/**
 * The redux store for the app. This is the source of all state in the app. Avoid
 * useEffect in favor of this.
 */
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    location: locationReducer,
    arrivals: arrivalsSlice.reducer,
    map: mapSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(locationMiddleware.middleware),
});

/**
 * Typed wrapper for store state. Should be avoided in favor of useAppSelector.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Typed wrapper for dispatch. Should be avoided in favor of useAppDispatch.
 */
export type AppDispatch = typeof store.dispatch;

export default store;
