import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

export default function ForecastItem({ day, temp, main, unit = "C" }) {
  const iconName = weatherIcons[main] || "weather-sunny";

  return (
    <View style={styles.item}>
      <Text style={styles.day}>{day}</Text>
      <MaterialCommunityIcons name={iconName} size={36} color="#fff" />
      <Text style={styles.temp}>
        {temp}°{unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    alignItems: "center",
    width: 100,
  },
  day: {
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    fontSize: 14,
  },
  temp: {
    fontSize: 16,
    color: "#fff",
    marginTop: 5,
  },
});
