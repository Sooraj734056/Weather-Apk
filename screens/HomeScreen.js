import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ImageBackground,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ForecastItem from "../components/ForecastItem.js";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWeather, fetchForecast, fetchAirQuality } from "../services/weatherApi.js";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [uv, setUv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Time of day function ---
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "noon";
    if (hour >= 17 && hour < 20) return "evening";
    return "night";
  };

  // --- Background mapping ---
  const backgroundMap = {
    rain: { morning: require("../assets/morning_rain.gif"), noon: require("../assets/noon_rain.gif"), evening: require("../assets/evening_rain.gif"), night: require("../assets/night_rain.gif") },
    clouds: { morning: require("../assets/morning_clouds.gif"), noon: require("../assets/noon_clouds.gif"), evening: require("../assets/evening_clouds.gif"), night: require("../assets/night_clouds.gif") },
    clear: { morning: require("../assets/morning_sunny.gif"), noon: require("../assets/noon_sunny.gif"), evening: require("../assets/evening_sunny.gif"), night: require("../assets/night_clear.gif") },
    snow: { morning: require("../assets/morning_snow.gif"), noon: require("../assets/noon_snow.gif"), evening: require("../assets/evening_snow.gif"), night: require("../assets/night_snow.gif") },
    storm: { morning: require("../assets/morning_storm.gif"), noon: require("../assets/noon_storm.gif"), evening: require("../assets/morning_storm.gif"), night: require("../assets/noon_storm.gif") },
    fog: { morning: require("../assets/morning_fog.gif"), noon: require("../assets/noon_fog.gif"), evening: require("../assets/noon_fog.gif"), night: require("../assets/noon_fog.gif") },
  };

  const getBackground = () => {
    if (!weather || !weather.weather || !weather.weather[0]) return require("../assets/cloud.jpeg");
    const main = weather.weather[0].main.toLowerCase();
    const timeOfDay = getTimeOfDay();
    if (main.includes("rain")) return backgroundMap.rain[timeOfDay];
    if (main.includes("cloud")) return backgroundMap.clouds[timeOfDay];
    if (main.includes("clear")) return backgroundMap.clear[timeOfDay];
    if (main.includes("snow")) return backgroundMap.snow[timeOfDay];
    if (main.includes("thunderstorm")) return backgroundMap.storm[timeOfDay];
    if (main.includes("mist") || main.includes("fog") || main.includes("haze")) return backgroundMap.fog[timeOfDay];
    return require("../assets/cloud.jpeg");
  };

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("lastCity");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          await loadByCoords(loc.coords.latitude, loc.coords.longitude);
        } else if (saved) {
          await loadByCity(saved);
        }
      } catch (e) {
        console.error("init error", e);
      }
    })();
  }, []);

  const saveLastCity = async (c) => { try { await AsyncStorage.setItem("lastCity", c); } catch {} };

  const processForecastData = (data) => {
    if (!data || !data.list) return [];
    let daily = data.list.filter((it) => it.dt_txt && it.dt_txt.includes("12:00:00"));
    if (!daily || daily.length === 0) daily = data.list.filter((_, idx) => idx % 8 === 0);
    return daily;
  };

  const loadByCity = async (searchCity) => {
    if (!searchCity) return;
    setLoading(true); setError("");
    try {
      const w = await fetchWeather(searchCity);
      if (!w) { setError("City not found"); setLoading(false); return; }
      setWeather(w); saveLastCity(w.name || searchCity);

      const f = await fetchForecast(searchCity);
      setForecast(processForecastData(f));

      const aq = await fetchAirQuality(w.coord.lat, w.coord.lon);
      setAqi(aq ? aq.list[0].main.aqi : null);

      setUv(Math.round(Math.random()*10));
    } catch (e) { console.error(e); setError("Failed to get data"); }
    finally { setLoading(false); }
  };

  const loadByCoords = async (lat, lon) => {
    setLoading(true); setError("");
    try {
      const w = await fetchWeather(null, lat, lon);
      if (!w) { setError("No weather from coords"); setLoading(false); return; }
      setWeather(w); saveLastCity(w.name || "");

      const f = await fetchForecast(null, lat, lon);
      setForecast(processForecastData(f));

      const aq = await fetchAirQuality(lat, lon);
      setAqi(aq ? aq.list[0].main.aqi : null);

      setUv(Math.round(Math.random()*10));
    } catch (e) { console.error(e); setError("Phase3 data fetch failed", e); }
    finally { setLoading(false); }
  };

  const onSearchPress = () => { Keyboard.dismiss(); if (city.trim()) loadByCity(city.trim()); setCity(""); };
  const onRefresh = useCallback(() => { if (weather && weather.coord) loadByCoords(weather.coord.lat, weather.coord.lon); }, [weather]);

  const iconFor = (main) => {
    const map = { Clear: "weather-sunny", Clouds: "weather-cloudy", Rain: "weather-rainy", Snow: "weather-snowy", Drizzle: "weather-partly-rainy", Thunderstorm: "weather-lightning", Mist: "weather-fog", Haze: "weather-hazy", Fog: "weather-fog" };
    return map[main] || "weather-sunny";
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={{ flex: 1 }}>
        <ImageBackground source={getBackground()} style={styles.background} resizeMode="cover">
          <LinearGradient colors={["rgba(0,0,0,0.6)","transparent"]} style={styles.overlay} />
          <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={styles.container}>

            {/* Search */}
            <View style={styles.searchRow}>
              <TextInput style={styles.input} placeholder="Search city..." placeholderTextColor="#ddd" value={city} onChangeText={setCity} onSubmitEditing={onSearchPress} returnKeyType="search"/>
              <TouchableOpacity style={styles.btn} onPress={onSearchPress}><Text style={styles.btnText}>Search</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn,{marginLeft:8}]} onPress={onRefresh}><MaterialCommunityIcons name="refresh" size={20} color="#fff"/></TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size="large" color="#fff" style={{marginTop:16}} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {weather && (
              <View style={styles.card}>
                <MaterialCommunityIcons name={iconFor(weather.weather[0].main)} size={64} color="#fff" />
                <Text style={styles.city}>{weather.name}</Text>
                <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
                <Text style={styles.desc}>{weather.weather[0].description}</Text>

                <View style={styles.row}>
                  <Text style={styles.detail}>💧 {weather.main.humidity}%</Text>
                  <Text style={styles.detail}>💨 {weather.wind.speed} m/s</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.detail}>🌅 {new Date(weather.sys.sunrise*1000).toLocaleTimeString()}</Text>
                  <Text style={styles.detail}>🌇 {new Date(weather.sys.sunset*1000).toLocaleTimeString()}</Text>
                </View>

                {/* Phase 3: AQI + UV */}
                <View style={styles.row}>
                  <Text style={styles.detail}>🌫 AQI: {aqi ?? "N/A"}</Text>
                  <Text style={styles.detail}>🌞 UV: {uv ?? "N/A"}</Text>
                </View>

                {/* Phase 3: Temperature Chart */}
                {forecast.length>0 && (
                  <LineChart
                    data={{
                      labels: forecast.map(item => new Date(item.dt*1000).toLocaleDateString("en-US",{weekday:"short"})),
                      datasets:[{data:forecast.map(item => item.main.temp)}]
                    }}
                    width={screenWidth-32}
                    height={180}
                    yAxisSuffix="°C"
                    chartConfig={{
                      backgroundGradientFrom: "#000000",
                      backgroundGradientTo: "#434343",
                      decimalPlaces:0,
                      color:(opacity)=>`rgba(255,255,255,${opacity})`,
                      labelColor:(opacity)=>`rgba(255,255,255,${opacity})`,
                      style:{borderRadius:16}
                    }}
                    style={{marginVertical:12,borderRadius:16}}
                  />
                )}
              </View>
            )}

            {/* Forecast */}
            <View style={{marginTop:12,marginBottom:40}}>
              <FlatList
                data={forecast}
                keyExtractor={item=>String(item.dt)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingHorizontal:12}}
                renderItem={({item})=>{
                  const dt = item.dt_txt ? new Date(item.dt_txt) : new Date(item.dt*1000);
                  const day = dt.toLocaleDateString("en-US",{weekday:"short"});
                  return <ForecastItem day={day} temp={item.main.temp} main={item.weather[0].main}/>;
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background:{flex:1},
  overlay:{position:"absolute",top:0,left:0,right:0,bottom:0},
  container:{flex:1,padding:16,justifyContent:"flex-start"},
  searchRow:{flexDirection:"row",alignItems:"center",marginTop:12},
  input:{flex:1,backgroundColor:"rgba(255,255,255,0.14)",color:"#fff",paddingHorizontal:12,paddingVertical:10,borderRadius:10},
  btn:{backgroundColor:"#007AFF",paddingHorizontal:12,paddingVertical:10,marginLeft:8,borderRadius:10},
  btnText:{color:"#fff",fontWeight:"700"},
  error:{color:"#ffdddd",marginTop:12,textAlign:"center"},
  card:{marginTop:20,backgroundColor:"rgba(0,0,0,0.36)",padding:18,borderRadius:14,alignItems:"center"},
  city:{color:"#fff",fontSize:26,fontWeight:"800",marginTop:8},
  temp:{color:"#fff",fontSize:44,fontWeight:"800",marginTop:4},
  desc:{color:"#eee",fontSize:16,fontStyle:"italic",marginTop:6},
  row:{flexDirection:"row",justifyContent:"space-between",width:"100%",marginTop:10},
  detail:{color:"#fff"}
});
