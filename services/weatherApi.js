import { OPENWEATHERMAP_API_KEY } from "@env";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const fetchWeather = async (city) => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
    );
    return await response.json();
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
};

export const fetchForecast = async (city) => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
    );
    return await response.json();
  } catch (error) {
    console.error("Forecast fetch error:", error);
    return null;
  }
};
