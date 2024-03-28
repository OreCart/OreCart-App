import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  type ViewProps,
} from "react-native";

import QueryText from "../../common/components/QueryText";
import TextSkeleton from "../../common/components/TextSkeleton";
import Color from "../../common/style/color";
import { useDistance } from "../location/locationSlice";
import {
  formatMiles,
  formatSecondsAsMinutes,
  geoDistanceToMiles,
} from "../location/util";
import { type Stop } from "../stops/stopsSlice";
import { useArrivalEstimate } from "../vans/arrivalSlice";

import { type ParentRoute } from "./routesSlice";

/**
 * The props for the {@interface StopItem} component.
 */
interface RouteStopItemProps extends ViewProps {
  /** The stop to display. */
  stop: Stop;
  /** The parent route of the stop. The stop should be part of this. */
  route: ParentRoute;
  /** Called when the stop item is clicked on. */
  onPress: (stop: Stop) => void;
  invert: boolean;
}

/**
 * A component that renders a single stop item.
 */
export const RouteStopItem = ({
  style,
  stop,
  route,
  onPress,
  invert,
}: RouteStopItemProps): React.JSX.Element => {
  const distance = useDistance(stop);
  const arrivalEstimate = useArrivalEstimate(stop, route);

  return (
    <TouchableHighlight
      onPress={
        onPress !== undefined
          ? () => {
              onPress(stop);
            }
          : undefined
      }
      underlayColor={
        invert
          ? Color.csm.primary.ext.blaster_blue_highlight
          : Color.generic.selection
      }
      style={[styles.touchableContainer, style]}
    >
      <View style={styles.innerContainer}>
        <View style={styles.stopInfoContainer}>
          <Text style={styles.stopName}>
            <Text style={invert ? styles.invert : undefined}>{stop.name}</Text>
          </Text>
          <QueryText
            style={invert ? styles.invert : undefined}
            query={distance}
            body={(distance: number) => (
              <>
                <Text style={styles.emphasis}>
                  {formatMiles(geoDistanceToMiles(distance))}
                </Text>{" "}
                away
              </>
            )}
            skeletonWidth={0.3}
          />
          <QueryText
            style={invert ? styles.invert : undefined}
            query={arrivalEstimate}
            body={(arrivalEstimate: number | undefined) =>
              arrivalEstimate !== undefined ? (
                <>
                  Next OreCart in{" "}
                  <Text style={styles.emphasis}>
                    {formatSecondsAsMinutes(arrivalEstimate)}
                  </Text>
                </>
              ) : route.isActive ? (
                <>Running</>
              ) : (
                <>Not running</>
              )
            }
            skeletonWidth={0.5}
            error={"Failed to load time estimate"}
          />
        </View>
        <MaterialIcons
          name="arrow-forward"
          size={24}
          color={invert ? Color.generic.white : Color.generic.black}
        />
      </View>
    </TouchableHighlight>
  );
};

/**
 * A skeleton component that mimics the {@interface StopItem} component.
 */
export const RouteStopItemSkeleton = ({
  style,
}: ViewProps): React.JSX.Element => {
  return (
    <View style={[styles.innerContainer, style]}>
      <View style={styles.stopInfoContainer}>
        <TextSkeleton widthFraction={0.4} style={styles.stopName} />
        <TextSkeleton widthFraction={0.5} />
        <TextSkeleton widthFraction={0.6} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    borderRadius: 16,
  },
  highlightedTouchableContainer: {
    borderRadius: 16,
    backgroundColor: Color.csm.primary.blaster_blue,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  stopInfoContainer: {
    flex: 1,
    gap: 4,
  },
  stopName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emphasis: {
    fontWeight: "bold",
  },
  invert: {
    color: Color.generic.white,
  },
});
