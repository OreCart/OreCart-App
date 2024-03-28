import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View, type TextProps } from "react-native";

import { type Query } from "../query";
import Color from "../style/color";

import TextSkeleton from "./TextSkeleton";

interface QueryTextProps<T> extends TextProps {
  /**
   * The query to display the text for.
   */
  query: Query<T>;
  /**
   * A function that returns the text to display when the query is successful.
   */
  body: (data: T) => React.JSX.Element;
  /**
   * The width of the skeleton text as a fraction of the screen width.
   * Should be similar to the real loaded text length for a good user experience.
   */
  skeletonWidth: number;
  /**
   * The error message to display when the query fails.
   */
  error?: string;
}

/**
 * A text element that handles query state. Always use this component when you have
 * a query, as it improves the UX.
 */
function QueryText<T>({
  query,
  body,
  skeletonWidth,
  error,
  style,
  ...props
}: QueryTextProps<T>): React.JSX.Element {
  if (query.isSuccess) {
    return <Text style={style}>{body(query.data)}</Text>;
  }
  if (query.isLoading) {
    return (
      <TextSkeleton style={style} widthFraction={skeletonWidth} {...props} />
    );
  }
  if (query.isError && error !== undefined) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons
          name="error"
          size={16}
          style={styles.errorIcon}
          color={Color.generic.alert.primary}
        />
        <Text style={[style, styles.error]} {...props}>
          {error}
        </Text>
      </View>
    );
  }
  return <Text {...props} />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  error: {
    color: Color.generic.alert.primary,
    alignSelf: "center",
  },
  errorIcon: {},
});

export default QueryText;
