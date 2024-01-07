import React from "react";
import {
  TouchableHighlight,
  Text,
  StyleSheet,
  type ViewProps,
} from "react-native";

import Color from "../style/color";

interface RetryButtonProps extends ViewProps {
  retry: () => void;
}

const RetryButton = ({
  retry,
  ...rest
}: RetryButtonProps): React.JSX.Element => {
  return (
    <TouchableHighlight
      style={styles.retryButton}
      onPress={retry}
      underlayColor={Color.csm.primary.ext.blaster_blue_highlight}
    >
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  retryButton: {
    borderRadius: 100,
    backgroundColor: Color.csm.primary.blaster_blue,
    padding: 10,
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default RetryButton;
