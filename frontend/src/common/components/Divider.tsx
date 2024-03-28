import React from "react";
import { StyleSheet, View } from "react-native";

import Color from "../style/color";

/**
 * A generic divider component. Always use this when a divider is needed.
 */
const Divider = (): React.JSX.Element => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Color.csm.primary.pale_blue,
    marginVertical: 8,
  },
});

export default Divider;
