import React from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";

import RetryButton from "./RetryButton";

interface ErrorComponentProps extends ViewProps {
  /** The error message to show. */
  message: string;
  /** Hook to retry fetching the query that failed. */
  retry: () => Promise<object>;
}

/**
 * A standard error message and retry button indicator.
 */
const ErrorMessage: React.FC<ErrorComponentProps> = ({
  message,
  retry,
  style,
}) => {
  return (
    <View style={[style]}>
      <Text style={styles.header}>{message}</Text>
      <RetryButton
        retry={() => {
          retry().catch(() => {});
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    alignSelf: "center",
  },
});

export default ErrorMessage;
