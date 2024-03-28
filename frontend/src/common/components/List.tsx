import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, RefreshControl, type ViewProps } from "react-native";

import { type Query } from "../query";

import Divider from "./Divider";
import ErrorMessage from "./ErrorMessage";
import SkeletonList from "./SkeletonList";
import Spacer from "./Spacer";

export interface ListProps<T> extends ViewProps {
  /** Returns the header to render (Optional) */
  header?: () => React.JSX.Element;
  /** Returns the item to render. */
  item: (item: T) => React.JSX.Element;
  /** Returns the skeleton item to render. */
  itemSkeleton: () => React.JSX.Element;
  /** Whether to show a divider or a spacer */
  divider: "line" | "space";
  /** Returns the key for the item. */
  keyExtractor: (item: T) => string;
  /** Whether to use a bottom sheet or regular flat list */
  bottomSheet: boolean;
  /** The query to use to fetch the data */
  query: Query<T[]>;
  /** The function to call to refresh the query. */
  refresh: () => Promise<object>;
  /** The error message to show if the query fails */
  errorMessage: string;
}

/**
 * A list component that handles the needs to asynchrnous queries, headers, separators, and other
 * common functionality. Always use this component when you have a query or other complex list need,
 * as it improves the UX.
 */
function List<T>({
  header,
  item,
  itemSkeleton,
  divider,
  keyExtractor,
  bottomSheet,
  query,
  refresh,
  errorMessage,
  ...props
}: ListProps<T>): React.JSX.Element {
  return query.isSuccess ? (
    bottomSheet ? (
      <BottomSheetFlatList
        {...props}
        data={query.data}
        renderItem={({ item: data }) => item(data)}
        ListHeaderComponent={header}
        ItemSeparatorComponent={divider === "line" ? Divider : Spacer}
        focusHook={useFocusEffect}
        keyExtractor={keyExtractor}
      />
    ) : (
      <FlatList
        {...props}
        data={query.data}
        renderItem={({ item: data }) => item(data)}
        ListHeaderComponent={header}
        ItemSeparatorComponent={divider === "line" ? Divider : Spacer}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={query.isLoading}
            enabled={query.data !== undefined}
            onRefresh={() => {
              refresh().catch(() => {});
            }}
          />
        }
      />
    )
  ) : query.isLoading ? (
    <SkeletonList {...props} itemSkeleton={itemSkeleton} divider={divider} />
  ) : (
    <ErrorMessage {...props} message={errorMessage} retry={refresh} />
  );
}

export default List;
