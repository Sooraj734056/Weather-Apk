import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const weatherIcons = {
  Clear: "weather-sunny",
  Clouds: "weather-cloudy",
  Rain: "weather-rainy",
  Snow: "weather-snowy",
  Drizzle: "weather-partly-rainy",
  Thunderstorm: "weather-lightning",
  Mist: "weather-fog",
  Haze: "weather-hazy",
  Fog: "weather-fog",
};

export default function ForecastItem({ day, temp, main }) {
  const iconName = weatherIcons[main] || "weather-sunny";

  return (
    <View style={styles.card}>
      <Text style={styles.day}>{day}</Text>
      <MaterialCommunityIcons name={iconName} size={36} color="#fff" />
      <Text style={styles.temp}>{Math.round(temp)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    alignItems: "center",
    width: 100,
  },
  day: {
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  temp: {
    marginTop: 8,
    color: "#fff",
    fontWeight: "600",
  },
});
