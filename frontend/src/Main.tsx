import { StyleSheet, View } from 'react-native'
import { Map } from './components/Map'
import { NavigationContainer } from '@react-navigation/native'

/**
 * The main screen containing the map and bottom sheet pattern.
 */
export function Main(): React.ReactElement<void> {
  return (
    <NavigationContainer>
      <Map style={StyleSheet.absoluteFillObject} />
    </NavigationContainer>
  )
}
