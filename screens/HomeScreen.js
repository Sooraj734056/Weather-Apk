import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { fetchWeather, fetchForecast } from "../services/weatherApi";
import ForecastItem from "../components/ForecastItem";

export default function HomeScreen() {
  const [city, setCity] = useState("New York");
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const getWeatherData = async (searchCity) => {
    setLoading(true);
    try {
      const weatherData = await fetchWeather(searchCity);
      const forecastData = await fetchForecast(searchCity);

      if (weatherData && weatherData.main) setWeather(weatherData);

      if (forecastData && forecastData.list) {
        const daily = forecastData.list.filter((item) =>
          item.dt_txt.includes("12:00:00")
        );
        setForecast(daily);
      }
    } catch (error) {
      console.log("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeatherData(city);
  }, []);

  const handleSearch = () => {
    Keyboard.dismiss();
    if (!input.trim()) return;
    setCity(input);
    getWeatherData(input);
    setInput("");
  };

  return (
    <ImageBackground
      source={require("../assets/cloud.jpeg")}
      style={StyleSheet.absoluteFillObject}
      resizeMode="cover"
    >
      <View style={styles.root}>
        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Enter a City..."
            style={styles.searchBar}
            placeholderTextColor="#555"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Go</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : weather ? (
          <>
            {/* Weather Card */}
            <View style={styles.card}>
              <Text style={styles.bigIcon}>☀️</Text>
              <Text style={styles.today}>Today</Text>
              <Text style={styles.city}>{weather.name}</Text>
              <Text style={styles.temp}>
                {weather.main.temp.toFixed(0)}°C
              </Text>
              <Text style={styles.desc}>{weather.weather[0].description}</Text>
            </View>

            {/* Forecast */}
            <FlatList
              data={forecast}
              keyExtractor={(item) => item.dt.toString()}
              horizontal
              renderItem={({ item }) => {
                const day = new Date(item.dt_txt).toLocaleDateString("en-US", {
                  weekday: "long",
                });
                return (
                  <ForecastItem
                    day={day}
                    temp={item.main.temp.toFixed(0)}
                    icon="⛅"
                  />
                );
              }}
              contentContainerStyle={styles.forecastList}
              showsHorizontalScrollIndicator={false}
            />
          </>
        ) : (
          <Text style={{ color: "white", fontSize: 18, marginTop: 20 }}>
            No weather data found
          </Text>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 12,
    fontSize: 16,
    elevation: 3,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  bigIcon: { fontSize: 64, marginBottom: 10 },
  today: { fontSize: 16, color: "#333" },
  city: { fontSize: 24, fontWeight: "bold" },
  temp: { fontSize: 32, marginTop: 5 },
  desc: { fontSize: 18, color: "#444", marginTop: 5 },
  forecastList: { paddingHorizontal: 10, paddingBottom: 40 },
});
