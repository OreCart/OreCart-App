import { StyleSheet } from "react-native";

export default StyleSheet.create({
  fill: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    pointerEvents: "box-none", // Allow touches to go through the overlay
    width: "100%",
    height: "100%",
  },
});
