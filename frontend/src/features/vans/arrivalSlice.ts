import {
  createAction,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import Constants from "expo-constants";
import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../common/hooks";
import { error, loading, success, type Query } from "../../common/query";
import { type Route } from "../routes/routesSlice";
import { type Stop } from "../stops/stopsSlice";

export const subscribeArrival =
  createAction<ArrivalSubscription>("arrivals/subscribe");
export const unsubscribeArrival = createAction<ArrivalSubscription>(
  "arrivals/unsubscribe",
);

// Makes the subsequent types easier to read, even if it's all still
// just numbers in the end.
type StopId = number;
type RouteId = number;
type Handle = number;
type Seconds = number;

interface ArrivalSubscription {
  stopId: StopId;
  routeId: RouteId;
}

interface SubscribeArrival extends ArrivalSubscription {
  handle: Handle;
}

type ArrivalSubscribers = Record<Handle, ArrivalSubscription>;
type ArrivalTimes = Record<Handle, Query<Seconds | undefined>>;

interface ArrivalsState {
  subscribers: ArrivalSubscribers;
  times: ArrivalTimes;
}

type ArrivalsResponse = Record<StopId, Record<RouteId, Seconds>>;
type ArrivalResult = ArrivalSuccess | ArrivalsError;

interface ArrivalSuccess {
  type: "arrivals";
  arrivals: ArrivalsResponse;
}

interface ArrivalsError {
  type: "error";
  error: string;
}

const initialState: ArrivalsState = {
  subscribers: {},
  times: {},
};

/**
 * The slice managing the currently stored arrivals data and arrival subscribers. This should
 * not need to be used by any component. Use the hook abstractions instead.
 */
export const arrivalsSlice = createSlice({
  name: "arrivals",
  initialState,
  reducers: {
    setSubscribers: (state, action: PayloadAction<SubscribeArrival>) => {
      state.subscribers[action.payload.handle] = action.payload;
      state.times[action.payload.handle] = loading();
    },
    removeSubscribers: (state, action: PayloadAction<number>) => {
      // I have no choice but to use dynamic delete here, Redux hates the Map object.
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete state.subscribers[action.payload];
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete state.times[action.payload];
    },
    setArrivalTimes: (state, action: PayloadAction<ArrivalsResponse>) => {
      // The backend response will be in the same structure as our message, however
      // some time estimates will be unavailable and thus undefined. Go through each
      // subscription and update the time estimate if it exists.
      for (const handle in state.subscribers) {
        const { stopId, routeId } = state.subscribers[handle];
        state.times[handle] = success(action.payload[stopId]?.[routeId]);
      }
    },
    setArrivalError: (state, action: PayloadAction<string>) => {
      for (const handle in state.subscribers) {
        state.times[handle] = error(action.payload);
      }
    },
  },
});

const { setSubscribers, removeSubscribers, setArrivalTimes, setArrivalError } =
  arrivalsSlice.actions;

const stopArrivalsApiUrl = `${Constants.expoConfig?.extra?.wsApiUrl}/vans/v2/arrivals/subscribe`;

/**
 * Manage the arrival estimate websocket that will be subscribed to by other components. Should be
 * done in the parent component of all subscribing components. This should only be called once.
 */
export const manageArrivalEstimates = (): void => {
  const [ws, setWs] = useState<WebSocket | undefined>(undefined);
  const [intervalHandle, setIntervalHandle] = useState<
    NodeJS.Timeout | undefined
  >(undefined);
  const dispatch = useAppDispatch();
  const subscribers = useAppSelector((state) => state.arrivals.subscribers);
  const [stupidCounter, setStupidCounter] = useState<number>(0);

  useEffect(() => {
    if (ws === undefined) {
      const ws = new WebSocket(stopArrivalsApiUrl);
      ws.addEventListener("message", (event) => {
        const result: ArrivalResult = JSON.parse(event.data);
        if (result.type === "arrivals") {
          dispatch(setArrivalTimes(result.arrivals));
        } else {
          dispatch(setArrivalError(result.error));
        }
      });

      ws.addEventListener("open", () => {
        setWs(ws);
      });

      ws.addEventListener("close", () => {
        setWs(undefined);
      });

      ws.addEventListener("error", (e) => {
        setWs(undefined);
        dispatch(setArrivalError("Failed to connect websocket"));
      });

      // For some reason ws.send within a useEffect setInterval call doesn't work,
      // but changing some state that is hooked to another useEffect that then does
      // the send... does. I don't know why. Now you know why it's called stupidCounter.
      const handle = setInterval(() => {
        setStupidCounter((i) => i + 1);
      }, 2000);
      setIntervalHandle(handle);
    }
    return () => {
      ws?.close();
      setWs(undefined);
      clearInterval(intervalHandle);
      setIntervalHandle(undefined);
    };
  }, []);

  useEffect(() => {
    // Need to accumulate all of the subscriber information into
    // a single query of: { stopId: [specificRouteIdsToGetEstimates...], ...}
    // we don't want to actually bundle this query format into the subscriber
    // information, as it makes it to fungible and impossible for subscribers
    // to change what they are subscribing to without leaving behind now useless
    // queries.
    const query: Record<number, number[]> = {};
    for (const handle in subscribers) {
      const { stopId, routeId } = subscribers[handle];
      if (query[stopId] === undefined) {
        query[stopId] = [];
      }
      if (query[stopId].includes(routeId)) {
        continue;
      }
      query[stopId].push(routeId);
    }
    ws?.send(JSON.stringify(query));
  }, [ws, subscribers, stupidCounter]); // Fire when opening websocket, changing subscribers, or interval events.
};

/**
 * Subscribe for the estimated time that a shuttle will arrive on the given stop
 * on the given route. The stop must be part of the route.
 */
export const useArrivalEstimate = (
  stop: Stop,
  route: Route,
): Query<number | undefined> => {
  // Make up a handle to identify this subscription, allowing us to update it
  // to new values while not leaving any residual query parameters behind.
  const [handle] = useState<number>(Math.random());
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setSubscribers({ handle, stopId: stop.id, routeId: route.id }));
    return () => {
      dispatch(removeSubscribers(handle));
    };
  }, [stop, route]);

  // There will be a weird period where useEffect has not executed yet and the
  // subscription result may not be defined, so we need to handle that case and
  // fall back to loading.
  return useAppSelector((state) => state.arrivals.times[handle] ?? loading());
};

/**
 * Subscribe for the estimated time that a shuttle will arrive on the given stop
 * on the given route. The stop must be part of the route. The stop can be a
 * deferred query on this function.
 */
export const useArrivalEstimateQuery = (
  stop: Query<Stop>,
  route: Route,
): Query<number | undefined> => {
  // Make up a handle to identify this subscription, allowing us to update it
  // to new values while not leaving any residual query parameters behind.
  const [handle] = useState<number>(Math.random());
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Cant change amount of hooks, so we need to check if the stop is still loading.
    if (!stop.isSuccess) {
      return;
    }
    dispatch(
      setSubscribers({ handle, stopId: stop.data.id, routeId: route.id }),
    );
    return () => {
      dispatch(removeSubscribers(handle));
    };
  }, [stop.data, route]); // Rely on stop data, since techincally the queries passed here may be new instances.

  return useAppSelector((state) => state.arrivals.times[handle] ?? loading());
};
