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
import { formatSecondsAsMinutes } from "../location/util";
import { type Route } from "../routes/routesSlice";
import { useArrivalEstimate } from "../vans/arrivalSlice";

import { type ParentStop } from "./stopsSlice";

interface StopRouteItemProps {
  /** The route to show */
  route: Route;
  /** The parent stop of the route. This stop should be on the given route. */
  stop: ParentStop;
  /** Called when the item is pressed */
  onPress: (route: Route) => void;
}
/**
 * A component that renders a single route item in a stop context.
 */
export const StopRouteItem = ({
  route,
  stop,
  onPress,
}: StopRouteItemProps): React.JSX.Element => {
  const routeNameColorStyle = {
    color: route.color,
  };
  const arrivalEstimate = useArrivalEstimate(stop, route);

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
export const StopRouteItemSkeleton = ({
  style,
}: ViewProps): React.JSX.Element => {
  return (
    <View style={[styles.innerContainer, style]}>
      <View style={styles.routeInfoContainer}>
        <TextSkeleton widthFraction={0.4} style={[styles.routeName]} />
        <TextSkeleton widthFraction={0.6} />
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
