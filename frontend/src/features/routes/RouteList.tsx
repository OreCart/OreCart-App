import React from "react";
import { FlatList, StyleSheet, Text, View, type ViewProps } from "react-native";

import Divider from "../../common/components/Divider";
import RetryButton from "../../common/components/RetryButton";
import SkeletonList from "../../common/components/SkeletonList";
import LayoutStyle from "../../common/style/layout";

import { RouteItem, RouteItemSkeleton } from "./RouteItem";
import { useGetRoutesQuery } from "./routesSlice";
import { type Route } from "./routesSlice";

interface RouteListProps extends ViewProps {
  /** Called when the route item is clicked on. */
  onPress: (route: Route) => void;
}

/**
 * Screen that displays a list of routes.
 */
const RouteList = ({ onPress }: RouteListProps): React.JSX.Element => {
  const {
    data: routes,
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = useGetRoutesQuery();

  function retry(): void {
    refetch().catch(console.error);
  }

  return (
    <View style={[LayoutStyle.fill]}>
      {isLoading ? (
        <SkeletonList
          style={styles.routeContainer}
          divider={true}
          generator={() => <RouteItemSkeleton />}
        />
      ) : isSuccess ? (
        <FlatList
          style={styles.routeContainer}
          data={routes}
          renderItem={({ item }) => (
            <RouteItem route={item} onPress={onPress} />
          )}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={Divider}
        />
      ) : isError ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.header}>
            We couldn't fetch the routes right now. Try again later.
          </Text>
          <RetryButton retry={retry} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  routeContainer: {
    paddingHorizontal: 8,
  },
  loadingContainer: {
    padding: 16,
  },
  header: {
    textAlign: "center",
    paddingBottom: 16,
  },
});

export default RouteList;
