import { createAction, createListenerMiddleware } from "@reduxjs/toolkit";
import * as Location from "expo-location";
import { useEffect } from "react";

import { useAppDispatch } from "../../common/hooks";
import { error, loading, success } from "../../common/query";

import { updateLocationStatus } from "./locationSlice";

const locationMiddleware = createListenerMiddleware();
const subscribeLocation = createAction<undefined>("location/start");
const unsubscribeLocation = createAction<undefined>("location/stop");
export const requestLocationPermissions = createAction<undefined>(
  "location/requestPermissions",
);

// This seems to be the only accuracy that's at least somewhat reliable for our purposes. Takes a few seconds
// to initialize and then updates every second or so.
const ACCURACY = Location.Accuracy.BestForNavigation;

let locationSubscription: Location.LocationSubscription | null = null;

// The problem with location updates is that they are a callback-based API with sensitive lifecycle limitations
// that we need to cram into the redux API. This could be done simpler with a manager hook like in other parts of
// the app, but handling something like location permissions would then become impossible. This middleware attempts
// to abstract this process with the following lifecycle:
// 1. The top-level Main component calls manageLocationMiddleware(), which then sends a subscribe action to
// the middleware. This creates the subscription and forwards them to the state in the location slice.
// 2. The top-level Main component unmounts, which sends an unsubscribe action to the middleware. The middleware
// immediately unsubscribes and frees the subscription. This way, we can stop tracking location as soon as the
// app is no longer visible.

// We will need to track two events: When the app starts location tracking, and when it stops it. Each startListening
// call listens for one of these events and performs the appropriate action.

// Listen for when location tracking starts
locationMiddleware.startListening({
  // actionCreator specifies the action that when dispatched will trigger the
  // code below.
  actionCreator: subscribeLocation,
  effect: async (_, listenerApi) => {
    if (locationSubscription !== null) {
      // Nothing to do
      return;
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      // Permission was not granted, we can't do anything. Send the outcome
      // to the companion slice state.
      listenerApi.dispatch(updateLocationStatus(error("Not granted")));
      return;
    }

    listenerApi.dispatch(updateLocationStatus(loading()));

    try {
      // Have to track the current subscription so we can unsubscribe later.
      locationSubscription = await Location.watchPositionAsync(
        { accuracy: ACCURACY },
        (newLocation) => {
          // Forward updates to the companion slice so that components can
          // use the current state.
          listenerApi.dispatch(
            updateLocationStatus(
              success({
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              }),
            ),
          );
        },
      );
    } catch (e) {
      listenerApi.dispatch(
        updateLocationStatus(error("Failed to start location tracking.")),
      );
    }
  },
});

// Listen for when location tracking stops
locationMiddleware.startListening({
  // actionCreator specifies the action that when dispatched will trigger the
  // code below.
  actionCreator: unsubscribeLocation,
  effect: async (_, listenerApi) => {
    if (locationSubscription === null) {
      // Nothing to do
      return;
    }

    locationSubscription.remove();
    locationSubscription = null;
    listenerApi.dispatch(updateLocationStatus(loading()));
  },
});

// Listen for when location permissions should be requested
locationMiddleware.startListening({
  // actionCreator specifies the action that when dispatched will trigger the
  // code below.
  actionCreator: requestLocationPermissions,
  effect: async (_, listenerApi) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      listenerApi.dispatch(subscribeLocation());
    }
  },
});

export default locationMiddleware;

/**
 * Convienence function to automatically start/stop the location middleware. This should be called
 * in the highest level component that still has access to the redux store.
 */
export function manageLocationMiddleware(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(subscribeLocation());

    return () => {
      dispatch(unsubscribeLocation());
    };
  }, []);
}
