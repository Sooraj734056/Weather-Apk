import axios from "axios";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const fetchWeather = async (city = null, lat = null, lon = null) => {
  try {
    let url = "";
    if (city) {
      url = `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`;
    } else if (lat && lon) {
      url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    } else return null;

    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("fetchWeather error:", err.message);
    return null;
  }
};

export const fetchForecast = async (city = null, lat = null, lon = null) => {
  try {
    let url = "";
    if (city) {
      url = `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    } else if (lat && lon) {
      url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    } else return null;

    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("fetchForecast error:", err.message);
    return null;
  }
};

export const fetchAirQuality = async (lat, lon) => {
  try {
    if (!lat || !lon) return null;
    const url = `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("fetchAirQuality error:", err.message);
    return null;
  }
};
