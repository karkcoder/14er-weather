const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const fourteeners = require("./data/fourteeners");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Weather service using Open-Meteo (free, no API key required)
class WeatherService {
  constructor() {
    this.baseUrl = "https://api.open-meteo.com/v1";
  }

  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current:
            "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility",
          temperature_unit: "fahrenheit",
          wind_speed_unit: "mph",
          timezone: "America/Denver",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching current weather:", error.message);
      throw error;
    }
  }

  async getForecast(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          daily:
            "temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant",
          hourly: "temperature_2m,weather_code,wind_speed_10m",
          temperature_unit: "fahrenheit",
          wind_speed_unit: "mph",
          timezone: "America/Denver",
          forecast_days: 3,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching forecast:", error.message);
      throw error;
    }
  }

  // Convert Open-Meteo weather codes to descriptions
  getWeatherDescription(code) {
    const weatherCodes = {
      0: { description: "Clear sky", condition: "Clear", icon: "01d" },
      1: { description: "Mainly clear", condition: "Clear", icon: "01d" },
      2: { description: "Partly cloudy", condition: "Clouds", icon: "02d" },
      3: { description: "Overcast", condition: "Clouds", icon: "03d" },
      45: { description: "Fog", condition: "Fog", icon: "50d" },
      48: { description: "Depositing rime fog", condition: "Fog", icon: "50d" },
      51: { description: "Light drizzle", condition: "Drizzle", icon: "09d" },
      53: {
        description: "Moderate drizzle",
        condition: "Drizzle",
        icon: "09d",
      },
      55: { description: "Dense drizzle", condition: "Drizzle", icon: "09d" },
      56: {
        description: "Light freezing drizzle",
        condition: "Drizzle",
        icon: "09d",
      },
      57: {
        description: "Dense freezing drizzle",
        condition: "Drizzle",
        icon: "09d",
      },
      61: { description: "Slight rain", condition: "Rain", icon: "10d" },
      63: { description: "Moderate rain", condition: "Rain", icon: "10d" },
      65: { description: "Heavy rain", condition: "Rain", icon: "10d" },
      66: {
        description: "Light freezing rain",
        condition: "Rain",
        icon: "10d",
      },
      67: {
        description: "Heavy freezing rain",
        condition: "Rain",
        icon: "10d",
      },
      71: { description: "Slight snow fall", condition: "Snow", icon: "13d" },
      73: { description: "Moderate snow fall", condition: "Snow", icon: "13d" },
      75: { description: "Heavy snow fall", condition: "Snow", icon: "13d" },
      77: { description: "Snow grains", condition: "Snow", icon: "13d" },
      80: {
        description: "Slight rain showers",
        condition: "Rain",
        icon: "09d",
      },
      81: {
        description: "Moderate rain showers",
        condition: "Rain",
        icon: "09d",
      },
      82: {
        description: "Violent rain showers",
        condition: "Rain",
        icon: "09d",
      },
      85: {
        description: "Slight snow showers",
        condition: "Snow",
        icon: "13d",
      },
      86: { description: "Heavy snow showers", condition: "Snow", icon: "13d" },
      95: {
        description: "Thunderstorm",
        condition: "Thunderstorm",
        icon: "11d",
      },
      96: {
        description: "Thunderstorm with slight hail",
        condition: "Thunderstorm",
        icon: "11d",
      },
      99: {
        description: "Thunderstorm with heavy hail",
        condition: "Thunderstorm",
        icon: "11d",
      },
    };

    return (
      weatherCodes[code] || {
        description: "Unknown",
        condition: "Unknown",
        icon: "01d",
      }
    );
  }

  async getWeatherForMountain(mountain) {
    try {
      const [current, forecast] = await Promise.all([
        this.getCurrentWeather(mountain.lat, mountain.lon),
        this.getForecast(mountain.lat, mountain.lon),
      ]);

      // Get current weather info
      const currentWeather = this.getWeatherDescription(
        current.current.weather_code
      );

      // Get today's, tomorrow's, and day after tomorrow's forecast
      const today = new Date();
      const todayIndex = 0; // Today is always the first day in the forecast
      const tomorrowIndex = 1; // Tomorrow is the second day
      const dayAfterIndex = 2; // Day after tomorrow is the third day

      return {
        mountain: mountain.name,
        elevation: mountain.elevation,
        current: {
          temperature: Math.round(current.current.temperature_2m),
          feelsLike: Math.round(current.current.apparent_temperature),
          condition: currentWeather.condition,
          description: currentWeather.description,
          humidity: current.current.relative_humidity_2m,
          windSpeed: Math.round(current.current.wind_speed_10m),
          windDirection: current.current.wind_direction_10m,
          windGusts: current.current.wind_gusts_10m
            ? Math.round(current.current.wind_gusts_10m)
            : null,
          visibility: Math.round(
            (current.current.visibility || 10000) * 0.000621371
          ), // Convert to miles
          icon: currentWeather.icon,
        },
        today: {
          high: Math.round(forecast.daily.temperature_2m_max[todayIndex]),
          low: Math.round(forecast.daily.temperature_2m_min[todayIndex]),
        },
        tomorrow: {
          high: Math.round(forecast.daily.temperature_2m_max[tomorrowIndex]),
          low: Math.round(forecast.daily.temperature_2m_min[tomorrowIndex]),
        },
        dayAfter: {
          high: Math.round(forecast.daily.temperature_2m_max[dayAfterIndex]),
          low: Math.round(forecast.daily.temperature_2m_min[dayAfterIndex]),
        },
      };
    } catch (error) {
      console.error(
        `Error getting weather for ${mountain.name}:`,
        error.message
      );
      return {
        mountain: mountain.name,
        elevation: mountain.elevation,
        error: "Weather data unavailable",
      };
    }
  }
}

const weatherService = new WeatherService();

// Routes
app.get("/api/mountains", (req, res) => {
  res.json(fourteeners);
});

app.get("/api/weather", async (req, res) => {
  try {
    console.log("Fetching weather data for all 14ers using Open-Meteo...");

    // Fetch weather for all mountains with rate limiting
    const weatherPromises = fourteeners.map((mountain, index) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const weather = await weatherService.getWeatherForMountain(mountain);
          resolve(weather);
        }, index * 200); // 200ms delay between requests to be respectful
      });
    });

    const weatherData = await Promise.all(weatherPromises);

    console.log("Weather data fetched successfully");
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/api/weather/:mountainName", async (req, res) => {
  try {
    const mountainName = decodeURIComponent(req.params.mountainName);
    const mountain = fourteeners.find(
      (m) => m.name.toLowerCase() === mountainName.toLowerCase()
    );

    if (!mountain) {
      return res.status(404).json({ error: "Mountain not found" });
    }

    const weather = await weatherService.getWeatherForMountain(mountain);
    res.json(weather);
  } catch (error) {
    console.error("Error fetching weather for mountain:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Serve the main app
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Total Colorado 14ers: ${fourteeners.length}`);
});
