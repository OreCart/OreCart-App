import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  TouchableHighlight,
  StyleSheet,
  type ViewProps,
  View,
} from "react-native";

/**
 * The props for the {@function LocationButton} component.
 */
export interface LocationButtonProps extends ViewProps {
  /** Whether the button should display that the user location is actively being followed. */
  isActive: boolean;
  /** Callback for when the button is pressed by the user. */
  onPress: () => void;
}

/**
 * A button that toggles whether the user's location is being followed.
 */
const LocationButton: React.FC<LocationButtonProps> = (props) => {
  return (
    <TouchableHighlight
      style={styles.button}
      underlayColor="#DDDDDD"
      onPress={props.onPress}
    >
      <View>
        {props.isActive ? (
          <MaterialIcons name="my-location" size={24} color="green" />
        ) : (
          <MaterialIcons name="location-searching" size={24} color="black" />
        )}
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "white",
    borderRadius: 50,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default LocationButton;
