import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  FlatList,
} from "react-native";

import Spacer from "../../common/components/Spacer";
import Color from "../../common/style/color";

import { AlertItem } from "./AlertItem";
import { useGetActiveAlertsQuery } from "./alertSlice";

/**
 * A component that renders a collapsible list of active alerts.
 */
const AlertBanner = (): React.JSX.Element | null => {
  const alerts = useGetActiveAlertsQuery().data;
  const [expanded, setExpanded] = useState(false);

  if (alerts === undefined || alerts.length === 0) {
    return null;
  }

  // It would be best to reduce the friction of the user having to expand the component
  // if there is just one alert, as we have the space to show it in it's entirety
  // (as we do later on in the component)
  const expandable = alerts.length > 1;

  return (
    <View style={styles.spacing}>
      <TouchableHighlight
        underlayColor={Color.generic.alert.pressed}
        onPress={
          expandable
            ? () => {
                setExpanded((expanded) => !expanded);
              }
            : undefined
        }
        style={styles.container}
      >
        <View>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Alert</Text>
            {/* Indicate the expansion status with an icon, or hide it if we don't need to be expandable. */}
            {expandable ? (
              <MaterialIcons
                name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color={Color.generic.white}
              />
            ) : null}
          </View>
          {/*  */}
          {expanded && expandable ? (
            <FlatList
              data={alerts}
              style={styles.alertsContainer}
              renderItem={({ item }) => (
                /* Want to put the alert information into a container to differentiate it from others */
                <AlertItem style={styles.elevatedAlertContainer} alert={item} />
              )}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={Spacer}
            />
          ) : /* If there's just one alert, resulting in the component not being expandable,
          we would want to show it in full rather than require the user to expand it, given that we have the space. */
          expandable ? (
            <Text
              style={styles.alertText}
            >{`${alerts.length} currently active`}</Text>
          ) : (
            <AlertItem alert={alerts[0]} />
          )}
        </View>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  spacing: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  container: {
    padding: 16,
    backgroundColor: Color.generic.alert.primary,
    borderRadius: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alertsContainer: {
    marginTop: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: Color.generic.white,
  },
  elevatedAlertContainer: {
    padding: 8,
    backgroundColor: Color.generic.alert.elevated,
    borderRadius: 8,
  },
  alertText: {
    fontSize: 16,
    color: Color.generic.white,
  },
});

export default AlertBanner;
