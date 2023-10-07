import MapView, { type Region } from 'react-native-maps'
import { StyleSheet, type ViewProps, Platform } from 'react-native'
import { type Coordinate } from '../services/location'
import { useRef, useState } from 'react'

const GOLDEN: Region = {
  latitude: 39.749675,
  longitude: -105.222606,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05
}

/**
 * Wraps the expo {@interface MapView} with additional functionality.
 */
export function Map(props: ViewProps): React.ReactElement<ViewProps> {
  const [userRegionChanged, setUserRegionChanged] = useState(false)
  const mapRef = useRef<MapView>(null)

  function followUserLocationAndroid(location: Coordinate | undefined): void {
    // We want to make sure we won't snap back to the user location if they decide to pan around,
    // so check if that's the case before panning.
    if (location !== undefined && mapRef.current != null && !userRegionChanged)  {
      mapRef.current.animateCamera({
        center: location,
        zoom: 17
      })
    }
  }

  return (
    <MapView style={styles.innerMap}
      ref={mapRef}
      initialRegion={GOLDEN}
      showsUserLocation={true}
      // Android only.
      showsMyLocationButton={false}
      // followsUserLocation is only available on iOS, so we must reimplement the behavior on Android
      // with onUserLocationChange.
      followsUserLocation={!userRegionChanged}
      onUserLocationChange={Platform.select({ 
        android: event => { followUserLocationAndroid(event.nativeEvent.coordinate) } 
      })}      
      onRegionChange={(_region, details) => { 
        // If the user is panning around, we don't want to snap back to their location.
        // However, when we automatically pan to the location as part of the followsUserLocation
        // reimplementation on android, this callback would be triggered and disable future pans.
        // To prevent this, we check if the user is panning around by checking if the change was a
        // gesture. This is not supported on iOS, but since we will only be panning the camera around
        // on android, this is fine.
        if (details.isGesture ?? true) {
          setUserRegionChanged(true) 
        }
      }} />
  )
}

const styles = StyleSheet.create({
  innerMap: {
    width: '100%',
    height: '100%'
  }
})
