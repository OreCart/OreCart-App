import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, type ViewProps } from "react-native";

import { type Query } from "../query";

import Divider from "./Divider";
import ErrorMessage from "./ErrorMessage";
import SkeletonList from "./SkeletonList";

export interface ParentChildListProps<P, C> extends ViewProps {
  /** Returns the header to render for the parent. */
  header: (parent: P) => React.JSX.Element;
  /** Returns the skeleton header to render for the parent. */
  headerSkeleton?: () => React.JSX.Element;
  /** Returns the item to render for the child. */
  item: (parent: P, child: C) => React.JSX.Element;
  /** Returns the skeleton item to render for the child. */
  itemSkeleton: () => React.JSX.Element;
  /** Whether to show a divider or a spacer */
  divider: "line" | "space";
  /** Returns the key for the item. */
  keyExtractor: (item: C) => string;
  /** Whether to use a bottom sheet or regular flat list */
  bottomSheet: boolean;
  /** Maps the parent data to the child data. */
  map: (parent: P) => C[];
  /** The query to use to fetch the data */
  query: Query<P>;
  /** The function to call to refresh the query. */
  refresh: () => Promise<object>;
  /** The error message to show if the query fails */
  errorMessage: string;
}

/**
 * A list component that takes parent data to use in the header, and then child data from the parent
 * to use as list itesm. Always use this component when you have a query or other complex list need
 * within a detail context (i.e like a Route), as it improves the UX.
 */
function ParentChildList<P, C>({
  header,
  headerSkeleton,
  item,
  itemSkeleton,
  divider,
  keyExtractor,
  bottomSheet,
  map,
  query,
  refresh,
  errorMessage,
  ...props
}: ParentChildListProps<P, C>): React.JSX.Element {
  return query.isSuccess ? (
    bottomSheet ? (
      <BottomSheetFlatList
        {...props}
        data={map(query.data)}
        renderItem={({ item: child }) => item(query.data, child)}
        ListHeaderComponent={() => header(query.data)}
        ItemSeparatorComponent={divider === "line" ? Divider : Divider}
        focusHook={useFocusEffect}
        keyExtractor={keyExtractor}
      />
    ) : (
      <FlatList
        {...props}
        data={map(query.data)}
        renderItem={({ item: child }) => item(query.data, child)}
        ListHeaderComponent={() => header(query.data)}
        ItemSeparatorComponent={divider === "line" ? Divider : Divider}
        keyExtractor={keyExtractor}
      />
    )
  ) : query.isLoading ? (
    <SkeletonList
      {...props}
      headerSkeleton={headerSkeleton}
      itemSkeleton={itemSkeleton}
      divider={divider}
    />
  ) : (
    <ErrorMessage {...props} message={errorMessage} retry={refresh} />
  );
}

export default ParentChildList;
