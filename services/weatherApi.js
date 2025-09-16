import { OPENWEATHERMAP_API_KEY } from "@env";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

// ✅ Weather Fetch Function
export const fetchWeather = async (city, lat = null, lon = null) => {
  try {
    let url = "";

    if (lat && lon) {
      // Location-based request
      url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    } else {
      // City-based request
      url = `${BASE_URL}/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    }

    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
};

// ✅ Forecast Fetch Function
export const fetchForecast = async (city, lat = null, lon = null) => {
  try {
    let url = "";

    if (lat && lon) {
      // Location-based forecast
      url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    } else {
      // City-based forecast
      url = `${BASE_URL}/forecast?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    }

    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Forecast fetch error:", error);
    return null;
  }
};
