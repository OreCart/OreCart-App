import BottomSheet from "@gorhom/bottom-sheet";
import React from "react";
import { Dimensions, StyleSheet, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Color from "../style/color";

/**
 * The props for the {@interface Sheet} component.
 */
export interface SheetProps extends ViewProps {
  /** How much of the bottom sheet to show initially as a fraction of the screen, such as '0.5' for half of the screen */
  collapsedFraction: number;
  /** The amount to inset the bottom sheet by in it's expanded state. Already includes the status bar, so do not add that. */
  expandedInset: number;
  /** The child view of the bottom sheet */
  children: React.ReactNode;
}

/**
 * Wraps the bottom sheet component with a simplified interface.
 */
const Sheet = ({
  collapsedFraction,
  expandedInset,
  children,
}: SheetProps): React.JSX.Element => {
  // BottomSheet does have a topInset property, but that causes the shadow of the bottom
  // sheet to become clipped at the top for some reason. Instead, we manually recreate it
  // by adjusting our snap points such that they will cause the sheet to never overlap the
  // status bar.
  const screenHeight = Dimensions.get("window").height;
  const insets = useSafeAreaInsets();
  // Height normally excludes the status bar, so we want to figure out exactly how much of the
  // screen size given by Dimensions is actually available to us.
  const expandedPercent =
    (100 * screenHeight) / (screenHeight + insets.top + expandedInset);
  // Then we can adjust that calculated value by the specified extent of the collapsed
  // bottom sheet.
  const collapsedPercent =
    (100 * collapsedFraction * screenHeight) / (screenHeight + insets.top);
  const snapPoints = [collapsedPercent + "%", expandedPercent + "%"];

  return (
    <BottomSheet
      style={styles.innerBottomSheetStyle}
      index={0}
      enableOverDrag={false}
      snapPoints={snapPoints}
    >
      {children}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  innerBottomSheetStyle: {
    // Required to get the shadow to render
    backgroundColor: Color.generic.white,
    borderRadius: 24,
    shadowColor: Color.generic.black,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 24.0,
    elevation: 24,
  },
});

export default Sheet;
