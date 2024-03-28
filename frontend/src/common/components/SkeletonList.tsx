import React from "react";
import { View, type ViewProps } from "react-native";

import Divider from "./Divider";

/**
 * The props for the {@interface SkeletonList} component.
 */
interface SkeletonListProps extends ViewProps {
  headerSkeleton?: () => React.ReactNode;
  /** Returns the skeleton item to render. */
  itemSkeleton: () => React.ReactNode;
  /** Whether to show a divider or a spacer */
  divider: "line" | "space";
}

/**
 * A component that renders a list of skeleton items with decreasing opacity.
 */
const SkeletonList = ({
  style,
  itemSkeleton,
  headerSkeleton,
  divider,
}: SkeletonListProps): React.JSX.Element => {
  return (
    <View style={style}>
      {/* Render the header skeleton if it exists */}
      {headerSkeleton !== undefined ? headerSkeleton() : null}
      {/* for (i = 0; i < 3; ++i) */}
      {Array.from({ length: 3 }).map((_, index) => (
        // 1 / 2^i maps to 1.0 opacity, 0.5 opacity, 0.25 opacity, etc.
        <View key={index} style={{ opacity: 1 / Math.pow(2, index) }}>
          {itemSkeleton()}
          {/* Add a divider between each item, except the last one, 
          to be consistent with FlatList */}
          {index < 2 ? divider === "line" ? <Divider /> : <Divider /> : null}
        </View>
      ))}
    </View>
  );
};

export default SkeletonList;
