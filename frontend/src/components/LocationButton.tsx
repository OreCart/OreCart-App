import React from 'react';
import { TouchableHighlight, StyleSheet, type ViewProps, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface LocationButtonProps {
  isActive: boolean,
  onPress: () => void
}

export function LocationButton(props: ViewProps & LocationButtonProps): React.ReactElement {
  return (
    <TouchableHighlight style={styles.button} underlayColor="#DDDDDD" onPress={props.onPress}>
      <View>
        { props.isActive ? <MaterialIcons name="my-location" size={24} color="green" /> : 
          <MaterialIcons name="location-searching" size={24} color="black" /> }
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    borderRadius: 50,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default LocationButton;
