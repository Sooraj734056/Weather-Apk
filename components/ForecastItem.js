import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ForecastItem({ day, temp, icon }) {
  return (
    <View style={styles.item}>
      <Text style={styles.day}>{day}</Text>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.temp}>{temp}°C</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 8,
    alignItems: "center",
    width: 100,
  },
  day: { fontWeight: "bold" },
  icon: { fontSize: 28, marginVertical: 5 },
  temp: { fontSize: 16 },
});
