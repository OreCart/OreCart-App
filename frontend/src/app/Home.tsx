import { MaterialIcons } from "@expo/vector-icons";
import { type NavigationProp, type RouteProp } from "@react-navigation/core";
import {
  CardStyleInterpolators,
  createStackNavigator,
  type StackNavigationProp,
} from "@react-navigation/stack";
import Constants from "expo-constants";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FloatingButton from "../common/components/FloatingButton";
import { type InnerParamList, type OuterParamList } from "../common/navTypes";
import Color from "../common/style/color";
import { fonts } from "../common/style/fonts";
import LayoutStyle from "../common/style/layout";
import SpacingStyle from "../common/style/spacing";
import { LandingScreen } from "../features/landing/LandingScreen";
import { manageLocationMiddleware } from "../features/location/locationMiddleware";
import Map from "../features/map/Map";
import Sheet from "../features/navigation/Sheet";
import { RouteScreen } from "../features/routes/RouteScreen";
import { StopScreen } from "../features/stops/StopScreen";

export interface HomeScreenProps {
  navigation: StackNavigationProp<OuterParamList, "Home">;
  route: RouteProp<OuterParamList, "Home">;
}

const Stack = createStackNavigator<InnerParamList>();

/**
 * Controls the percentage of the screen taken up by the bottom sheet in
 * it's collapsed state.
 */
const SHEET_EXTENT = 0.5;

/**
 * The main screen containing the map and sheet components.
 */
const Home = ({ route, navigation }: HomeScreenProps): React.JSX.Element => {
  // The bottom sheet extends halfway across the screen, with the map
  // being inset accordingly.
  const screenHeight = Dimensions.get("window").height;
  const [open, setOpen] = useState(false);
  const mapInsets = { bottom: screenHeight * SHEET_EXTENT };
  const insets = useSafeAreaInsets();
  const drawerInsets = { top: insets.top };
  const expoVersion = Constants.expoConfig?.version;
  const [atLanding, setAtLanding] = useState<boolean>(true);

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
            {/* <TouchableOpacity
              onPress={() => {
                navigation.push("ADARequest");
              }}
            >
              <View style={styles.drawerItem}>
                <MaterialIcons name="accessible" size={24} color="black" />
                <Text style={styles.drawerItemText}>ADA Ride Request</Text>
              </View>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => {
                navigation.push("Alerts");
              }}
            >
              <View style={styles.drawerItem}>
                <MaterialIcons name="error-outline" size={24} color="black" />
                <Text style={[styles.drawerItemText, fonts.heading]}>
                  Upcoming Alerts
                </Text>
              </View>
            </TouchableOpacity>
            {/* 
            <TouchableOpacity
              onPress={() => {
                navigation.push("Settings");
              }}
            >
              <View style={styles.drawerItem}>
                <MaterialIcons name="settings" size={24} color="black" />
                <Text style={styles.drawerItemText}>Settings</Text>
              </View>
            </TouchableOpacity> */}

            {/* <TouchableOpacity
              onPress={() => {
                navigation.push("BugReport");
              }}
            >
              <View style={styles.drawerItem}>
                <MaterialIcons name="bug-report" size={24} color="black" />
                <Text style={styles.drawerItemText}>Bug Report</Text>
              </View>
            </TouchableOpacity> */}

            <Text style={fonts.body}>Version {expoVersion}</Text>
          </View>
        );
      }}
    >
      <GestureHandlerRootView>
        <Map style={LayoutStyle.fill} insets={mapInsets} />
        <View style={[LayoutStyle.overlay, SpacingStyle.pad(drawerInsets, 16)]}>
          <FloatingButton
            onPress={() => {
              // Open the drawer if were at the landing page, pop the inner navigation stack otherwis
              if (atLanding) {
                setOpen((prevOpen: boolean) => !prevOpen);
              } else {
                navigation.goBack();
              }
            }}
          >
            <MaterialIcons
              name={atLanding ? "menu" : "arrow-back"}
              size={24}
              color="black"
            />
          </FloatingButton>
        </View>
        {/* Must inset bottom sheet down by the drawer button (16 + 8 + 48 + 8 + 16) */}
        <Sheet collapsedFraction={SHEET_EXTENT} expandedInset={96}>
          {/* Should disable headers on these screens since they arent full size. */}
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              cardStyle: { backgroundColor: Color.generic.white },
            }}
            screenListeners={({ navigation: innerNavigation }) => ({
              state: (_) => {
                // Outer navigation will still say it can go back (since we can exit the app). So we need to check
                // the inner navigation. The typecast is necessary so we can indicate that canGoBack will return a
                // boolean.
                const typedInnerNavigation =
                  innerNavigation as NavigationProp<InnerParamList>;
                setAtLanding(!typedInnerNavigation.canGoBack());
              },
            })}
          >
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Route" component={RouteScreen} />
            <Stack.Screen name="Stop" component={StopScreen} />
          </Stack.Navigator>
        </Sheet>
      </GestureHandlerRootView>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  drawerItem: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  drawerItemText: {
    paddingLeft: 4,
    fontSize: 18,
  },
});

export default Home;
