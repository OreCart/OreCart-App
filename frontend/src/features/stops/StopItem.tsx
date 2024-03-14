import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  type ViewProps,
} from "react-native";

import TextSkeleton from "../../common/components/TextSkeleton";
import Color from "../../common/style/color";
import { fonts } from "../../common/style/fonts";
import { useLocation } from "../location/locationSlice";
import {
  closest,
  distance,
  formatMiles,
  formatSecondsAsMinutes,
  geoDistanceToMiles,
} from "../location/util";
import { type BasicRoute } from "../routes/routesSlice";
import { useGetVansQuery, type VanLocation } from "../vans/vansSlice";

import { type BasicStop, type ExtendedStop } from "./stopsSlice";

/**
 * The props for the {@interface StopItem} component.
 */
interface StopItemProps {
  /** The stop to display. */
  stop: BasicStop;
  inRoute?: BasicRoute;
  /** Called when the stop item is clicked on. */
  onPress: (stop: BasicStop) => void;
}

/**
 * A component that renders a single stop item.
 */
export const StopItem = ({
  stop,
  inRoute,
  onPress,
}: StopItemProps): React.JSX.Element => {
  const stopState = useStopState(stop, inRoute);

  // TODO: Remove as soon as we fetch colors from backend

  return (
    <TouchableHighlight
      onPress={() => {
        onPress(stop);
      }}
      underlayColor={Color.generic.selection}
      style={styles.touchableContainer}
    >
      <View style={styles.innerContainer}>
        <View style={styles.stopInfoContainer}>
          <Text style={[styles.stopName, fonts.heading]}>{stop.name}</Text>
          {stopState.distanceFromUser !== undefined ? (
            <Text style={[styles.stopStatus, fonts.body]}>
              <Text style={[styles.stopStatusEmphasis, fonts.bodyBold]}>
                {stopState.distanceFromUser}
              </Text>{" "}
              away
            </Text>
          ) : null}
          {stopState.vanArrivalTime !== undefined ? (
            <Text style={[styles.stopStatus, fonts.body]}>
              Next OreCart in{" "}
              <Text style={styles.stopStatusEmphasis}>
                {stopState.vanArrivalTime}
              </Text>
            </Text>
          ) : stop.isActive ? (
            <Text style={[styles.stopStatus, fonts.body]}>Running</Text>
          ) : (
            <Text style={[styles.stopStatus, fonts.body]}>Not running</Text>
          )}
        </View>
        <MaterialIcons
          name="arrow-forward"
          size={24}
          color={Color.generic.black}
        />
      </View>
    </TouchableHighlight>
  );
};

interface StopState {
  distanceFromUser?: string;
  vanArrivalTime?: string;
}

function useStopState(stop: ExtendedStop, inRoute?: BasicRoute): StopState {
  const location = useLocation();
  const vans = useGetVansQuery().data;

  const stopState: StopState = {};

  if (location !== undefined && vans !== undefined) {
    const distanceMiles = geoDistanceToMiles(distance(stop, location));

    const arrivingVans = vans
      .filter(
        (van) =>
          (inRoute === undefined || van.routeId === inRoute.id) &&
          van.location !== undefined &&
          van.location.nextStopId === stop.id,
      )
      .map((van) => van.location) as VanLocation[];
    const closestStopVan = closest(arrivingVans, location);

    if (distanceMiles !== undefined) {
      stopState.distanceFromUser = formatMiles(distanceMiles);
    }

    if (closestStopVan !== undefined) {
      stopState.vanArrivalTime = formatSecondsAsMinutes(
        closestStopVan.inner.secondsToNextStop,
      );
    }
  }

  return stopState;
}

/**
 * A skeleton component that mimics the {@interface StopItem} component.
 */
export const StopItemSkeleton = ({ style }: ViewProps): React.JSX.Element => {
  return (
    <View style={[styles.innerContainer, style]}>
      <View style={styles.stopInfoContainer}>
        <TextSkeleton widthFraction={0.4} style={[styles.stopName]} />
        <TextSkeleton widthFraction={0.5} style={[styles.stopStatus]} />
        <TextSkeleton widthFraction={0.6} style={[styles.stopStatus]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    borderRadius: 16,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  stopInfoContainer: {
    flex: 1,
  },
  stopName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stopStatus: {
    marginBottom: 4,
  },
  stopStatusEmphasis: {
    fontWeight: "bold",
  },
});
