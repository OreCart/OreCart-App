import {
  Oswald_700Bold,
  RobotoMono_400Regular,
  OpenSans_400Regular,
  OpenSans_700Bold,
} from "@expo-google-fonts/dev";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

import Home from "./app/Home";
import store from "./app/store";
import { type OuterParamList } from "./common/navTypes";
import Color from "./common/style/color";
import { fonts } from "./common/style/fonts";
import LayoutStyle from "./common/style/layout";
import { ADARequestScreen } from "./features/ada/ADARequestScreen";
import { AlertScreen } from "./features/alert/AlertScreen";
import { BugReportScreen } from "./features/report/BugReportScreen";
import { SettingsScreen } from "./features/settings/SettingsScreen";

// -----
// DO NOT PUT ANY SUBSTANTIAL UI OR LOGIC INTO THIS FILE. ONLY INCLUDE SYSTEM CONFIGURATION.
// -----

if (Platform.OS === "android") {
  NavigationBar.setBackgroundColorAsync(Color.generic.white).catch(
    console.error,
  );
  // Enable later to do full edge-to-edge
  // NavigationBar.setPositionAsync("absolute");
  // // transparent backgrounds to see through
  // NavigationBar.setBackgroundColorAsync("#ffffff00");
  // // changes the color of the button icons "dark||light"
  // NavigationBar.setButtonStyleAsync("dark");
}

const Stack = createStackNavigator<OuterParamList>();
SplashScreen.preventAutoHideAsync().catch(() => {});
const App = (): React.JSX.Element | null => {
  const [fontsLoaded] = useFonts({
    Oswald_700Bold,
    RobotoMono_400Regular,
    OpenSans_400Regular,
    OpenSans_700Bold,
  });

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <StatusBar style="auto" translucent backgroundColor="transparent" />
      <SafeAreaProvider style={LayoutStyle.fill}>
        <View style={LayoutStyle.fill} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                },
                cardStyle: { backgroundColor: Color.generic.white },
                headerTitleStyle: fonts.heading,
                headerBackTitleStyle: fonts.heading,
              }}
            >
              <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Alerts"
                component={AlertScreen}
                options={{ title: "Upcoming Alerts" }}
              />
              <Stack.Screen
                name="ADARequest"
                component={ADARequestScreen}
                options={{ title: "ADA Ride Request" }}
              />
              <Stack.Screen
                name="BugReport"
                component={BugReportScreen}
                options={{ title: "Bug Report" }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: "Settings" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast position="bottom" />
        </View>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
