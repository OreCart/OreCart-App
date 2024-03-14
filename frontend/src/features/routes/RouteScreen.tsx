import { type RouteProp } from "@react-navigation/native";
import { type StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ErrorMessage from "../../common/components/ErrorMessage";
import TextSkeleton from "../../common/components/TextSkeleton";
import { type InnerParamList } from "../../common/navTypes";
import Color from "../../common/style/color";
import { fonts } from "../../common/style/fonts";
import StopList from "../stops/StopList";
import { useGetStopsQuery } from "../stops/stopsSlice";

import { useGetRouteQuery, type BasicRoute } from "./routesSlice";

export interface RouteScreenProps {
  navigation: StackNavigationProp<InnerParamList, "Route">;
  route: RouteProp<InnerParamList, "Route">;
}

export const RouteScreen = ({
  route: navRoute,
  navigation,
}: RouteScreenProps): React.JSX.Element => {
  const { routeId } = navRoute.params;
  const {
    data: route,
    isError: routeError,
    refetch: refetchRoute,
  } = useGetRouteQuery(routeId);
  const {
    data: stops,
    isError: stopsError,
    refetch: refetchStops,
  } = useGetStopsQuery();

  const routeStops = stops?.filter((stop) => stop.routeIds.includes(routeId));

  function retryRoute(): void {
    refetchRoute().catch(console.error);
  }

  function retryStops(): void {
    refetchStops().catch(console.error);
  }

  return (
    <View>
      {stopsError || routeError ? (
        <ErrorMessage
          style={styles.message}
          message="We couldn't fetch the route right now. Try again later."
          retry={() => {
            retryRoute();
            retryStops();
          }}
        />
      ) : (
        <StopList
          stops={routeStops}
          inRoute={route}
          renderRoute={(route) => <RouteHeader route={route} />}
          renderRouteSkeleton={() => <RouteSkeleton />}
          onPress={(stop) => {
            navigation.push("Stop", { stopId: stop.id });
          }}
        />
      )}
    </View>
  );
};

const RouteHeader = ({ route }: { route: BasicRoute }): React.JSX.Element => {
  const routeNameColorStyle = { color: Color.orecart.get(route?.name) };

  return (
    <View style={styles.container}>
      <Text style={[styles.routeName, routeNameColorStyle, fonts.heading]}>
        {route?.name}
      </Text>
      <Text style={[styles.routeDesc, fonts.body]}>
        {getDescriptionWorkaround(route)}
      </Text>
    </View>
  );
};

const RouteSkeleton = (): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <TextSkeleton style={styles.routeName} widthFraction={0.4} />
      <TextSkeleton style={styles.routeDesc} widthFraction={0.6} />
    </View>
  );
};

// TODO: REMOVE AS SOON AS POSSIBLE!!!!
const getDescriptionWorkaround = (route: BasicRoute): string | undefined => {
  switch (route.name) {
    case "Tungsten":
      return "Travels between campus and the RTD W Line Stop";

    case "Silver":
      return "Travels between campus and Mines Park";

    case "Gold":
      return "Travels between campus and downtown Golden";

    default:
      return undefined;
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  routeName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  routeDesc: {
    fontSize: 16,
  },
  message: {
    marginVertical: 16,
  },
});
