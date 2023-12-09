import React from "react";
import {
  FlatList,
  Text,
  View,
  type ViewProps,
  StyleSheet,
  TouchableHighlight,
} from "react-native";

import { useGetRoutesQuery } from "../api/routes";
import Divider from "../components/Divider";
import { RouteItem, RouteItemSkeleton } from "../components/RouteItem";
import SkeletonList from "../components/SkeletonList";
import Color from "../style/color";
import LayoutStyle from "../style/layout";

/**
 * Screen that displays a list of routes.
 */
const RouteList: React.FC<ViewProps> = () => {
  const {
    data: routes,
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = useGetRoutesQuery({});

  function retry(): void {
    refetch().catch(console.error);
  }

  return (
    <View style={[LayoutStyle.fill]}>
      {isLoading ? (
        <SkeletonList
          style={styles.routeContainer}
          generator={() => <RouteItemSkeleton />}
        />
      ) : isSuccess ? (
        <FlatList
          style={styles.routeContainer}
          data={routes}
          renderItem={({ item }) => <RouteItem route={item} />}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={Divider}
        />
      ) : isError ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.header}>
            We couldn't fetch the routes right now. Try again later.
          </Text>
          <TouchableHighlight
            style={styles.retryButton}
            onPress={retry}
            underlayColor={Color.csm.primary.ext.blaster_blue_highlight}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableHighlight>
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
  retryButton: {
    borderRadius: 100,
    backgroundColor: Color.csm.primary.blaster_blue,
    padding: 10,
    alignItems: "center",
  },
  retryButtonText: {
    color: Color.generic.white,
    fontWeight: "500",
  },
});

export default RouteList;
