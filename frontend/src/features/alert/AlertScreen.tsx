import { type RouteProp } from "@react-navigation/native";
import { type StackNavigationProp } from "@react-navigation/stack";
import { Text, View, FlatList, StyleSheet, RefreshControl } from "react-native";

import RetryButton from "../../common/components/RetryButton";
import SkeletonList from "../../common/components/SkeletonList";
import Spacer from "../../common/components/Spacer";
import { type OuterParamList } from "../../common/navTypes";
import Color from "../../common/style/color";

import { AlertItem, AlertItemSkeleton } from "./AlertItem";
import { useGetFutureAlertsQuery } from "./alertSlice";

export interface AlertsScreenProps {
  navigation: StackNavigationProp<OuterParamList, "Alerts">;
  route: RouteProp<OuterParamList, "Alerts">;
}

export const AlertScreen = ({
  route,
  navigation,
}: AlertsScreenProps): React.JSX.Element => {
  const {
    data: alerts,
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = useGetFutureAlertsQuery();

  function retry(): void {
    refetch().catch(console.error);
  }

  return (
    <View style={[styles.container]}>
      {isLoading ? (
        <SkeletonList
          divider={false}
          generator={() => (
            <View style={styles.alertItemSkeleton}>
              <AlertItemSkeleton />
            </View>
          )}
        />
      ) : isSuccess ? (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={Spacer}
          renderItem={({ item }) => (
            <View style={[styles.alertItem]}>
              <AlertItem alert={item} />
            </View>
          )}
          refreshControl={
            // We only want to indicate refreshing when prior data is available.
            // Otherwise, the skeleton list will indicate loading
            <RefreshControl
              refreshing={isLoading && alerts !== undefined}
              onRefresh={retry}
            />
          }
        />
      ) : isError ? (
        <>
          <Text style={styles.header}>
            We couldn't fetch the alerts right now. Try again later.
          </Text>
          <RetryButton retry={retry} />
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  alertItemSkeleton: {
    padding: 16,
    backgroundColor: Color.generic.selection,
    borderRadius: 16,
  },
  alertItem: {
    backgroundColor: Color.generic.alert.primary,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    textAlign: "center",
    paddingBottom: 16,
  },
});
