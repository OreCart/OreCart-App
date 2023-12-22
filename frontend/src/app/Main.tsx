import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Constants from 'expo-constants';
import FloatingButton from "../common/components/FloatingButton";
import LayoutStyle from "../common/style/layout";
import SpacingStyle from "../common/style/spacing";
import { manageLocationMiddleware } from "../features/location/locationMiddleware";
import Map from "../features/map/Map";
import Sheet from "../features/navigation/Sheet";
import RouteList from "../features/routes/RouteList";

/**
 * Controls the percentage of the screen taken up by the bottom sheet in
 * it's collapsed state.
 */
const SHEET_EXTENT = 0.5;

/**
 * The main screen containing the map and sheet components.
 */
const Main: React.FC<ViewProps> = () => {
  // The bottom sheet extends halfway across the screen, with the map
  // being inset accordingly.
  const screenHeight = Dimensions.get("window").height;
  const [open, setOpen] = useState(false);
  const mapInsets = { bottom: screenHeight * SHEET_EXTENT };
  const insets = useSafeAreaInsets();
  const drawerInsets = { top: insets.top };
  const expoVersion = Constants.expoConfig?.version;

  manageLocationMiddleware();

  return (
    <Drawer
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      renderDrawerContent={() => {
        return (
          <View style={SpacingStyle.pad(drawerInsets, 16)}>
            <TouchableOpacity onPress={()=>{
              setOpen(false);
            }}>
                <View style={styles.drawerItem}>
                  <MaterialIcons name="accessible" size={24} color="black" /> 
                  <Text style={styles.drawerItemText}>ADA Ride Request</Text>
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={()=>{
              setOpen(false);
            }}>
                <View style={styles.drawerItem}>
                  <MaterialIcons name="error-outline" size={24} color="black" /> 
                  <Text style={styles.drawerItemText}>Upcoming Outages</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>{
              setOpen(false);
            }}>
                <View style={styles.drawerItem}>
                  <MaterialIcons name="settings" size={24} color="black" /> 
                  <Text style={styles.drawerItemText}>Settings</Text>
                </View>
            </TouchableOpacity>
  
            <TouchableOpacity onPress={()=>{
              setOpen(false);
            }}>
                <View style={styles.drawerItem}>
                  <MaterialIcons name="bug-report" size={24} color="black" /> 
                  <Text style={styles.drawerItemText}>Bug Report</Text>
                </View>
            </TouchableOpacity>
  
            <Text>Version {expoVersion}</Text>
          </View>
        );
      }}
    >
      <GestureHandlerRootView>
        <Map style={LayoutStyle.fill} insets={mapInsets} />
        <View style={[LayoutStyle.overlay, SpacingStyle.pad(drawerInsets, 16)]}>
          <FloatingButton
            onPress={() => {
              setOpen((prevOpen: boolean) => !prevOpen);
            }}
          >
            <MaterialIcons name="menu" size={24} color="black" />
          </FloatingButton>
        </View>
        {/* Must inset bottom sheet down by the drawer button (16 + 8 + 48 + 8 + 16) */}
        <Sheet collapsedFraction={SHEET_EXTENT} expandedInset={96}>
          <RouteList />
        </Sheet>
      </GestureHandlerRootView>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  drawerItem: {
    alignItems: 'center', 
    flexDirection: 'row',
    marginBottom: 16,
  },
  drawerItemText: {
    paddingLeft: 4,
    fontSize: 18
  }
});

export default Main;
