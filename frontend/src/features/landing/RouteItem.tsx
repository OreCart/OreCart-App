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
import { mapQuery, type Query } from "../../common/query";
import Color from "../../common/style/color";
import { useClosest, type Closest } from "../location/locationSlice";
import {
  formatMiles,
  formatSecondsAsMinutes,
  geoDistanceToMiles,
} from "../location/util";
import { type ParentRoute } from "../routes/routesSlice";
import { type Stop } from "../stops/stopsSlice";
import { useArrivalEstimateQuery } from "../vans/arrivalSlice";

interface RouteItemProps {
  /** The route to display. */
  route: ParentRoute;
  /** Called when the route item is clicked on. */
  onPress: (route: ParentRoute) => void;
}
/**
 * A component that renders a single route item.
 */
export const RouteItem = ({
  route,
  onPress,
}: RouteItemProps): React.JSX.Element => {
  const routeNameColorStyle = {
    color: route.color,
  };
  const closestStop: Query<Closest<Stop>> = useClosest(route.stops);
  const stop = mapQuery(closestStop, (closestStop) => closestStop.value);
  const arrivalEstimate: Query<number | undefined> = useArrivalEstimateQuery(
    stop,
    route,
  );

  return (
    <TouchableHighlight
      onPress={() => {
        onPress(route);
      }}
      underlayColor={Color.generic.selection}
      style={styles.touchableContainer}
    >
      <View style={styles.innerContainer}>
        <View style={styles.routeInfoContainer}>
          <Text style={[styles.routeName, routeNameColorStyle]}>
            {route.name}
          </Text>
          <QueryText
            query={closestStop}
            body={(closestStop: Closest<Stop>) => (
              <Text>
                Closest stop at{" "}
                <Text style={styles.emphasis}>{closestStop.value.name}</Text> (
                {formatMiles(geoDistanceToMiles(closestStop.distance))} away)
              </Text>
            )}
            skeletonWidth={0.5}
          />
          <QueryText
            query={arrivalEstimate}
            body={(arrivalEstimate: number | undefined) =>
              arrivalEstimate !== undefined ? (
                <Text>
                  Next OreCart in{" "}
                  <Text style={styles.emphasis}>
                    {formatSecondsAsMinutes(arrivalEstimate)}
                  </Text>
                </Text>
              ) : route.isActive ? (
                <Text>Running</Text>
              ) : (
                <Text>Not running</Text>
              )
            }
            skeletonWidth={0.6}
            error={"Failed to load time estimate"}
          />
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

/**
 * A skeleton component that mimics the {@interface RouteItem} component.
 */
export const RouteItemSkeleton = ({ style }: ViewProps): React.JSX.Element => {
  return (
    <View style={[styles.innerContainer, style]}>
      <View style={styles.routeInfoContainer}>
        <TextSkeleton widthFraction={0.4} style={styles.routeName} />
        <TextSkeleton widthFraction={0.6} />
        <TextSkeleton widthFraction={0.5} />
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
  routeInfoContainer: {
    flex: 1,
    gap: 4,
  },
  routeName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emphasis: {
    fontWeight: "bold",
  },
});
