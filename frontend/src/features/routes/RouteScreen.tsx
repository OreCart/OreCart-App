import { type RouteProp } from "@react-navigation/native";
import { type StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ParentChildList from "../../common/components/ParentChildList";
import TextSkeleton from "../../common/components/TextSkeleton";
import { type InnerParamList } from "../../common/navTypes";
import { mapQuery, wrapReduxQuery } from "../../common/query";
import Color from "../../common/style/color";
import { useClosest } from "../location/locationSlice";
import { changeMapFocus, type MapFocus } from "../map/mapSlice";
import { type Stop } from "../stops/stopsSlice";

import { useGetRouteQuery, type ParentRoute } from "./routesSlice";
import { RouteStopItem, RouteStopItemSkeleton } from "./RouteStopItem";

export interface RouteScreenProps {
  navigation: StackNavigationProp<InnerParamList, "Route">;
  route: RouteProp<InnerParamList, "Route">;
}

/**
 * Shows route information and stops. Will refocus the map onto the given route.
 */
export const RouteScreen = ({
  route: navRoute,
  navigation,
}: RouteScreenProps): React.JSX.Element => {
  const route = useGetRouteQuery(navRoute.params.routeId);
  const routeFocus: MapFocus | undefined = route.isSuccess
    ? { type: "SingleRoute", route: route.data }
    : undefined;
  changeMapFocus(routeFocus);

  return (
    <ParentChildList
      style={styles.listContainer}
      header={(route: ParentRoute) => (
        <RouteHeader
          route={route}
          onClosestStopPress={(stop: Stop) => {
            navigation.push("Stop", { stopId: stop.id });
          }}
        />
      )}
      headerSkeleton={() => <RouteHeaderSkeleton />}
      item={(route: ParentRoute, stop: Stop) => (
        <RouteStopItem
          route={route}
          stop={stop}
          onPress={(stop: Stop) => {
            navigation.push("Stop", { stopId: stop.id });
          }}
          invert={false}
        />
      )}
      itemSkeleton={() => <RouteStopItemSkeleton />}
      divider="line"
      query={wrapReduxQuery<ParentRoute>(route)}
      refresh={route.refetch}
      map={(route: ParentRoute) => route.stops}
      keyExtractor={(stop: Stop) => stop.id.toString()}
      bottomSheet={true}
      errorMessage="Failed to load route. Please try again."
    />
  );
};

const RouteHeader = ({
  route,
  onClosestStopPress,
}: {
  route: ParentRoute;
  onClosestStopPress: (stop: Stop) => void;
}): React.JSX.Element => {
  const routeNameColorStyle = { color: route.color };
  const closestStop = useClosest<Stop>(route.stops);
  const stop = mapQuery(closestStop, (closestStop) => closestStop.value);

  return (
    <View>
      <View style={styles.headerInfoContainer}>
        <Text style={[styles.routeName, routeNameColorStyle]}>
          {route?.name}
        </Text>
        <Text style={styles.routeDesc}>{route.description}</Text>
      </View>
      <View style={styles.closestStopContainer}>
        <Text style={styles.closestStopHeader}>Closest Stop</Text>
        {stop.isSuccess ? (
          <RouteStopItem
            route={route}
            stop={stop.data}
            invert={true}
            onPress={onClosestStopPress}
          />
        ) : (
          <RouteStopItemSkeleton />
        )}
      </View>
      <Text style={styles.routePathHeader}>Route Path</Text>
    </View>
  );
};

const RouteHeaderSkeleton = (): React.JSX.Element => {
  return (
    <View>
      <View style={styles.headerInfoContainer}>
        <TextSkeleton style={[styles.routeName]} widthFraction={0.4} />
        <TextSkeleton style={styles.routeDesc} widthFraction={0.6} />
      </View>
      <View style={styles.closestStopContainerSkeleton}>
        <TextSkeleton style={styles.closestStopHeader} widthFraction={0.4} />
        <RouteStopItemSkeleton />
      </View>
      <TextSkeleton style={styles.routePathHeader} widthFraction={0.4} />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 8,
  },
  headerInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerSubheadContainer: {
    paddingHorizontal: 16,
  },
  routeName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  routeDesc: {
    fontSize: 16,
  },
  closestStopContainer: {
    backgroundColor: Color.csm.primary.blaster_blue,
    borderRadius: 16,
    marginVertical: 16,
  },
  closestStopContainerSkeleton: {
    backgroundColor: Color.generic.selection,
    borderRadius: 16,
    marginVertical: 16,
  },
  closestStopHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    marginHorizontal: 16,
    marginTop: 16,
    color: Color.csm.neutral.white,
  },
  routePathHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  message: {
    marginVertical: 16,
  },
});
