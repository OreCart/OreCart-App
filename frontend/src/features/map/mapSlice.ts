import { useFocusEffect } from "@react-navigation/native";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { useAppDispatch, useAppSelector } from "../../common/hooks";
import { type ParentRoute } from "../routes/routesSlice";
import { type ParentStop } from "../stops/stopsSlice";

/**
 * The current element the map is focused on.
 */
export type MapFocus = None | SingleRoute | SingleStop;

/**
 * The map is not focused on anything.
 */
export interface None {
  type: "None";
}

/**
 * The map is focused on a route.
 */
export interface SingleRoute {
  type: "SingleRoute";
  route: ParentRoute;
}

/**
 * The map is focused on a stop.
 */
export interface SingleStop {
  type: "SingleStop";
  stop: ParentStop;
}

interface MapState {
  focus: MapFocus;
}

const initialState: MapState = {
  focus: { type: "None" },
};

/**
 * Controls the current map focus. Should not be used by any component.
 */
export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    focusMap: (state, action: PayloadAction<MapFocus>) => {
      state.focus = action.payload;
    },
  },
});

const { focusMap } = mapSlice.actions;

/**
 * Causes the map to pan to the given focus. Note that this only works in
 * screens within a navigator due to the use of the `useFocusEffect` hook.
 */
export const changeMapFocus = (focus?: MapFocus): void => {
  const dispatch = useAppDispatch();
  useFocusEffect(() => {
    if (focus !== undefined) {
      dispatch(focusMap(focus));
    }
  });
};

/**
 * Hook for querying the current map focus.
 */
export const useMapFocus = (): MapFocus => {
  return useAppSelector((state) => state.map.focus);
};
