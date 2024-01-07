import React from "react";
import { Text, StyleSheet, type TextProps, Dimensions } from "react-native";

import Color from "../style/color";

interface TextSkeletonProps extends TextProps {
  widthFraction: number;
}

const TextSkeleton = ({
  widthFraction,
  style,
  ...rest
}: TextSkeletonProps): React.JSX.Element => {
  const screenWidth = Dimensions.get("window").width;
  const textWidth = screenWidth * widthFraction;

  // We want to make sure the placeholders have the same height as real text elements, so we simply
  // add empty text elements set to the same configuration as the normal text elements. By some quirk of
  // RN, this results in a text element that takes up the height needed without having to put any
  // placeholder text content.
  return (
    <Text
      style={[styles.textSkeleton, { width: textWidth }, style]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  textSkeleton: {
    backgroundColor: Color.generic.skeleton,
    borderRadius: 32,
    color: "transparent",
  },
});

export default TextSkeleton;
