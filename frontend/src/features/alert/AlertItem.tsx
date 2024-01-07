import { View, Text, StyleSheet, type ViewProps } from "react-native";

import TextSkeleton from "../../common/components/TextSkeleton";
import Color from "../../common/style/color";

import { type Alert } from "./alertSlice";

/**
 * The props for the {@interface AlertItem} component.
 */
interface AlertProps extends ViewProps {
  alert: Alert;
}

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * A component that displays a single alert's text description and
 * end date/time.
 */
export const AlertItem = ({
  alert,
  ...rest
}: AlertProps): React.JSX.Element => {
  const now = new Date().getTime() / 1000;

  let startTimestamp;
  let endTimestamp;
  if (alert.startDateTime > now) {
    // This is a future alert, so we want to indicate when it starts
    // and when it ends in exact datetimes.
    const startDate = new Date(alert.startDateTime * 1000);
    const endDate = new Date(alert.endDateTime * 1000);
    startTimestamp = `${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" },
    )}`;
    endTimestamp = `${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" },
    )}`;
  } else {
    // This is an ongoing alert, so we want to indicate only when it ends in a more
    // human-readable format.

    // If more than a week, use the date
    const endDate = new Date(alert.endDateTime * 1000);
    if (alert.endDateTime - now > 60 * 60 * 24 * 7) {
      // If more than a week, use the calendar date
      endTimestamp = endDate.toLocaleDateString();
    } else {
      // Otherwise, use the day of the week
      const endDate = new Date(alert.endDateTime * 1000);
      endTimestamp = daysOfWeek[endDate.getDay()];
    }
    // Add time in format of "at 12:00 PM"
    endTimestamp +=
      " at " +
      endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <View {...rest}>
      <Text style={styles.alertText}>{alert.text}</Text>
      {startTimestamp !== undefined ? (
        <Text style={styles.alertSubtext}>Starts {startTimestamp}</Text>
      ) : null}
      <Text style={styles.alertSubtext}>Ends {endTimestamp}</Text>
    </View>
  );
};

/**
 * A skeleton component that mimics the {@interface AlertItem} component.
 */
export const AlertItemSkeleton = ({
  ...rest
}: ViewProps): React.JSX.Element => {
  return (
    <View {...rest}>
      <TextSkeleton widthFraction={0.6} style={styles.alertText} />
      <TextSkeleton widthFraction={0.4} style={styles.alertSubtext} />
      <TextSkeleton widthFraction={0.4} style={styles.alertSubtext} />
    </View>
  );
};

const styles = StyleSheet.create({
  alertText: {
    fontSize: 16,
    color: Color.generic.white,
    marginBottom: 4,
  },
  alertSubtext: {
    color: Color.generic.white,
    fontStyle: "italic",
    marginBottom: 4,
  },
});
