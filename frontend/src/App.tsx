import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import Home from "./app/Home";
import store from "./app/store";
import { type OuterParamList } from "./common/navTypes";
import Color from "./common/style/color";
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
}

const Stack = createStackNavigator<OuterParamList>();

const App = (): React.JSX.Element => (
  <Provider store={store}>
    <SafeAreaProvider style={LayoutStyle.fill}>
      <View style={LayoutStyle.fill}>
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
      </View>
    </SafeAreaProvider>
  </Provider>
);

export default App;
