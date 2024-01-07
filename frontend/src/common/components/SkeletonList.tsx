import React from "react";
import { View, type ViewProps } from "react-native";

import Divider from "./Divider";
import Spacer from "./Spacer";

/**
 * The props for the {@interface SkeletonList} component.
 */
interface SkeletonProps extends ViewProps {
  /** Returns the skeleton item to render. */
  generator: () => React.ReactNode;
  /** Whether to show a divider or a spacer */
  divider: boolean;
}

/**
 * A component that renders a list of skeleton items with decreasing opacity.
 */
const SkeletonList = ({
  generator,
  divider,
}: SkeletonProps): React.JSX.Element => {
  return (
    <>
      {/* for (i = 0; i < 3; ++i) */}
      {Array.from({ length: 3 }).map((_, index) => (
        // 1 / 2^i maps to 1.0 opacity, 0.5 opacity, 0.25 opacity, etc.
        <View key={index} style={{ opacity: 1 / Math.pow(2, index) }}>
          {generator()}
          {/* Add a divider between each item, except the last one, 
          to be consistent with FlatList */}
          {index < 2 ? divider ? <Divider /> : <Spacer /> : null}
        </View>
      ))}
    </>
  );
};

export default SkeletonList;
