import Constants from "expo-constants";
import { useEffect, useState } from "react";

import { error, loading, success, type Query } from "../../common/query";
import { type Coordinate } from "../location/locationSlice";

const vanLocationApiUrl = `${Constants.expoConfig?.extra?.wsApiUrl}/vans/v2/subscribe/`;

export interface VanLocation {
  /** The identifier of the van that is currently at this location */
  guid: number;
  /** The color of the route this van is currently on */
  color: string;
  /** The current location of the van. */
  location: Coordinate;
}

interface VanLocationMessage {
  include: string[];
  query: VanLocationQuery;
}

interface VanLocationQuery {
  type: "vans" | "van";
  guid?: number;
  alive?: boolean;
  routeIds?: number[];
}

type VanLocationResponse = VanLocationSuccess | VanLocationError;

interface VanLocationSuccess {
  type: "vans";
  vans: VanLocation[];
}

interface VanLocationError {
  type: "error";
  error: string;
}

/**
 * Manage a van location websocket and get the resulting van locations from it.
 * This is only designed this way since one component (map) uses it. If you need
 * it in multiple places, you'll have to convert it to a subscriber system like in
 * arrivalSlice.ts.
 */
export const useVanLocations = (): Query<VanLocation[]> => {
  const [ws, setWs] = useState<WebSocket | undefined>(undefined);
  const [intervalHandle, setIntervalHandle] = useState<
    NodeJS.Timeout | undefined
  >(undefined);
  const [locations, setLocations] = useState<Query<VanLocation[]>>(loading());
  const [stupidCounter, setStupidCounter] = useState<number>(0);

  useEffect(() => {
    if (ws === undefined) {
      const ws = new WebSocket(vanLocationApiUrl);
      ws.addEventListener("message", (event) => {
        const result: VanLocationResponse = JSON.parse(event.data);
        if (result.type === "vans") {
          setLocations(success(result.vans));
        } else {
          setLocations(error(result.error));
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
        setLocations(error("Failed to connect to websocket"));
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
    const message: VanLocationMessage = {
      include: ["color", "location"], // Location is the whole point, and color is useful for the map.
      query: {
        type: "vans",
        alive: true,
      },
    };
    ws?.send(JSON.stringify(message));
  }, [ws, stupidCounter]); // Fire when opening the websocket or when the interval is fired.

  return locations;
};
