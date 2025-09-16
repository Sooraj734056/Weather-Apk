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
  RefreshControl,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import * as Location from "expo-location"; // ✅ added
import { fetchWeather, fetchForecast } from "../services/weatherApi.js";
import ForecastItem from "../components/ForecastItem.js";
import Autocomplete from "react-native-autocomplete-input";

const citySuggestions = ["New York", "London", "Delhi", "Mumbai", "Tokyo", "Sydney"];

export default function HomeScreen() {
  const [city, setCity] = useState("");
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("C"); 
  const [filteredCities, setFilteredCities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getWeatherData = async (searchCity, lat, lon) => {
    setLoading(true);
    try {
      let weatherData, forecastData;

      if (lat && lon) {
        // ✅ Location-based weather
        weatherData = await fetchWeather(null, lat, lon);
        forecastData = await fetchForecast(null, lat, lon);
      } else {
        // ✅ City-based weather
        weatherData = await fetchWeather(searchCity);
        forecastData = await fetchForecast(searchCity);
      }

      if (weatherData && weatherData.main) {
        setWeather(weatherData);
        setCity(weatherData.name);
      }

      if (forecastData && forecastData.list) {
        const daily = forecastData.list.filter((item) =>
          item.dt_txt.includes("12:00:00")
        );
        setForecast(daily);
      }
    } catch (error) {
      console.log("Error fetching weather:", error);
      Alert.alert("Error", "Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ App open hote hi current location ka weather
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Location permission is needed!");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      getWeatherData(null, latitude, longitude);
    })();
  }, []);

  const handleSearch = (selectedCity) => {
    const searchCity = selectedCity || input;
    if (!searchCity.trim()) return;
    setCity(searchCity);
    getWeatherData(searchCity);
    setInput("");
    setFilteredCities([]);
    Keyboard.dismiss();
  };

  const toggleUnit = () => {
    setUnit(unit === "C" ? "F" : "C");
  };

  const convertTemp = (tempC) => (unit === "C" ? tempC : tempC * 1.8 + 32);

  const onRefresh = async () => {
    setRefreshing(true);
    if (city) {
      await getWeatherData(city);
    }
    setRefreshing(false);
  };

  const updateFilteredCities = (text) => {
    setInput(text);
    if (text.length > 0) {
      const filtered = citySuggestions.filter((c) =>
        c.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  };

  const getBackground = () => {
    if (!weather) return require("../assets/cloud.jpeg");
    const main = weather.weather[0].main.toLowerCase();
    if (main.includes("rain")) return require("../assets/rain.gif");
    if (main.includes("cloud")) return require("../assets/clouds.gif");
    if (main.includes("clear")) return require("../assets/sunny.gif");
    if (main.includes("snow")) return require("../assets/snow.gif");
    return require("../assets/cloud.jpeg");
  };

  return (
    <ImageBackground
      source={getBackground()}
      style={StyleSheet.absoluteFillObject}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.root}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search */}
        <View style={styles.searchRow}>
          <Autocomplete
            data={filteredCities}
            defaultValue={input}
            onChangeText={updateFilteredCities}
            placeholder="Enter a city..."
            flatListProps={{
              keyExtractor: (_, idx) => idx.toString(),
              renderItem: ({ item }) => (
                <TouchableOpacity onPress={() => handleSearch(item)}>
                  <Text style={styles.suggestion}>{item}</Text>
                </TouchableOpacity>
              ),
            }}
            inputContainerStyle={styles.searchBar}
            listContainerStyle={styles.suggestionContainer}
          />
          <TouchableOpacity onPress={() => handleSearch()} style={styles.searchButton}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Go</Text>
          </TouchableOpacity>
        </View>

        {/* Unit Switch */}
        <View style={styles.unitRow}>
          <Text style={{ color: "white", marginRight: 10 }}>°C</Text>
          <Switch value={unit === "F"} onValueChange={toggleUnit} />
          <Text style={{ color: "white", marginLeft: 10 }}>°F</Text>
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
                {convertTemp(weather.main.temp).toFixed(0)}°{unit}
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
                  weekday: "short",
                });
                return (
               <ForecastItem
  day={day}
  temp={convertTemp(item.main.temp).toFixed(0)}
  main={item.weather[0].main}
  unit={unit}   // ✅ added
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
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingBottom: 50,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 12,
    elevation: 3,
  },
  suggestionContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 5,
  },
  suggestion: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
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
