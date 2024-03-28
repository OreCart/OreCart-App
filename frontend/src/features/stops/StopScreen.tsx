import { type RouteProp } from "@react-navigation/native";
import { type StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Linking, Platform, StyleSheet, Text, View } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";

import ParentChildList from "../../common/components/ParentChildList";
import QueryText from "../../common/components/QueryText";
import TextSkeleton from "../../common/components/TextSkeleton";
import { type InnerParamList } from "../../common/navTypes";
import { wrapReduxQuery } from "../../common/query";
import Color from "../../common/style/color";
import { useDistance, type Coordinate } from "../location/locationSlice";
import { formatMiles, geoDistanceToMiles } from "../location/util";
import { changeMapFocus, type MapFocus } from "../map/mapSlice";
import { type Route } from "../routes/routesSlice";

import { StopRouteItem, StopRouteItemSkeleton } from "./StopRouteItem";
import { useGetStopQuery, type ParentStop } from "./stopsSlice";

export interface StopScreenProps {
  navigation: StackNavigationProp<InnerParamList, "Stop">;
  route: RouteProp<InnerParamList, "Stop">;
}

/**
 * Shows stop information and parent routes. Will refocus the map onto the stop/
 */
export const StopScreen = ({
  route,
  navigation,
}: StopScreenProps): React.JSX.Element => {
  const stop = useGetStopQuery(route.params.stopId);
  const stopFocus: MapFocus | undefined = stop.isSuccess
    ? { type: "SingleStop", stop: stop.data }
    : undefined;
  changeMapFocus(stopFocus);

  return (
    <ParentChildList
      style={styles.listContainer}
      header={(stop: ParentStop) => <StopHeader stop={stop} />}
      headerSkeleton={() => <StopHeaderSkeleton />}
      item={(stop: ParentStop, route: Route) => (
        <StopRouteItem
          route={route}
          stop={stop}
          onPress={(route: Route) => {
            navigation.push("Route", { routeId: route.id });
          }}
        />
      )}
      itemSkeleton={() => <StopRouteItemSkeleton />}
      divider="line"
      query={wrapReduxQuery<ParentStop>(stop)}
      refresh={stop.refetch}
      map={(stop: ParentStop) => stop.routes}
      keyExtractor={(route: Route) => route.id.toString()}
      bottomSheet={true}
      errorMessage="Failed to load stop. Please try again."
    />
  );
};

const StopHeader = ({ stop }: { stop: ParentStop }): React.JSX.Element => {
  const distance = useDistance(stop);

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.stopName}>{stop.name}</Text>
      <QueryText
        style={styles.stopDesc}
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
      <TouchableHighlight
        underlayColor={Color.generic.location_highlight}
        style={[styles.button, styles.locationButton]}
        onPress={() => {
          openDirections(stop);
        }}
      >
        <Text style={styles.buttonText}>Get Directions</Text>
      </TouchableHighlight>
      <Text style={styles.stopHeader}>Routes</Text>
    </View>
  );
};

const StopHeaderSkeleton = (): React.JSX.Element => {
  return (
    <View style={styles.headerContainer}>
      <TextSkeleton style={styles.stopName} widthFraction={0.4} />
      <TextSkeleton style={styles.stopDesc} widthFraction={0.3} />
      <View style={[styles.button, styles.buttonSkeleton]}>
        <Text style={styles.buttonText}></Text>
      </View>
      <TextSkeleton style={styles.stopHeader} widthFraction={0.4} />
    </View>
  );
};

const openDirections = (coordinate: Coordinate): void => {
  const location = `${coordinate.latitude},${coordinate.longitude}`;
  const url = Platform.select({
    // Opens Apple Maps to immediately start navigation towards the stop
    ios: `http://maps.apple.com/?daddr=${location}`,
    // Opens Google Maps to show navigation options towards the stop
    android: `google.navigation:q=${location}`,
  });

  if (url === undefined) {
    // Should never happen, just make typescript happy
    console.error("Can't open directions on this platform");
    return;
  }

  Linking.canOpenURL(url)
    .then(async (supported) => {
      if (supported) {
        return await Linking.openURL(url);
      } else {
        console.error(`Don't know how to open URI: ${url}`);
      }
    })
    .catch((err) => {
      console.error("Can't launch directions", err);
    });
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 8,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stopName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stopDesc: {
    fontSize: 16,
  },
  routeItemSkeleton: {
    padding: 16,
    backgroundColor: Color.generic.selection,
    borderRadius: 16,
  },
  routeItem: {
    backgroundColor: Color.generic.alert.primary,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    textAlign: "center",
    paddingBottom: 16,
  },
  button: {
    borderRadius: 100,
    padding: 10,
    marginVertical: 16,
    alignItems: "center",
  },
  locationButton: {
    backgroundColor: Color.generic.location,
  },
  buttonSkeleton: {
    backgroundColor: Color.generic.skeleton,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  message: {
    marginVertical: 16,
  },
  emphasis: {
    fontWeight: "bold",
  },
  stopHeader: {
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 8,
  },
});
