import React, { useMemo } from "react";
import {
  StatusBar,
  type ViewProps,
  StyleSheet,
  Dimensions,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

/**
 * Wraps the bottom sheet component with a simplified interface.
 */
export function Sheet(
  props: SheetProps & ViewProps,
): React.ReactElement<SheetProps & ViewProps> {
  // BottomSheet does have a topInset property, but that causes the shadow of the bottom
  // sheet to become clipped at the top for some reason. Instead, we manually recreate it
  // by adjusting our snap points such that they will cause the sheet to never overlap the
  // status bar.
  const screenHeight = Dimensions.get("window").height;
  const statusBarHeight = useMemo(() => StatusBar.currentHeight ?? 0, []);
  // Height normally excludes the status bar, so we want to figure out exactly how much of the
  // screen size given by Dimensions is actually available to us.
  const expandedPercent =
    (100 * screenHeight) / (screenHeight + statusBarHeight);
  // Then we can adjust that calculated value by the specified extent of the collapsed
  // bottom sheet.
  const collapsedPercent = props.collapsedExtent * expandedPercent;
  const snapPoints = [collapsedPercent + "%", expandedPercent + "%"];

  return (
    <BottomSheet
      style={styles.innerBottomSheetStyle}
      index={0}
      enableOverDrag={false}
      snapPoints={snapPoints}
    >
      {props.children}
    </BottomSheet>
  );
}

/**
 * The props for the {@interface Sheet} component.
 */
export interface SheetProps {
  /** How much of the bottom sheet to show initially as a fraction of the screen, such as '0.5' for half of the screen */
  collapsedExtent: number;
  /** The child view of the bottom sheet */
  children: React.ReactNode;
}

const styles = StyleSheet.create({
  innerBottomSheetStyle: {
    // Required to get the shadow to render
    backgroundColor: "white",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 24.0,
    elevation: 24,
  },
});
