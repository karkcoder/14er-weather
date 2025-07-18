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
            "temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,cloud_cover_mean",
          hourly: "temperature_2m,weather_code,wind_speed_10m",
          temperature_unit: "fahrenheit",
          wind_speed_unit: "mph",
          timezone: "America/Denver",
          forecast_days: 7,
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

  // Evaluate hiking conditions for a 14er based on weather data
  evaluateHikingConditions(dayData, elevation) {
    let score = 100; // Start with perfect score
    let warnings = [];
    let positives = [];

    const highTemp = dayData.temperature_2m_max;
    const lowTemp = dayData.temperature_2m_min;
    const precipitation = dayData.precipitation_sum || 0;
    const windSpeed = dayData.wind_speed_10m_max || 0;
    const weatherCode = dayData.weather_code;
    const cloudCover = dayData.cloud_cover_mean || 0;

    // Temperature evaluation
    if (highTemp < 32) {
      score -= 30;
      warnings.push("Freezing temperatures - ice/snow conditions likely");
    } else if (highTemp < 40) {
      score -= 15;
      warnings.push("Very cold - hypothermia risk");
    } else if (highTemp >= 40 && highTemp <= 70) {
      score += 10;
      positives.push("Good temperature range for hiking");
    } else if (highTemp > 80) {
      score -= 10;
      warnings.push("Hot conditions - heat exhaustion risk");
    }

    // Precipitation evaluation
    if (precipitation > 0.5) {
      score -= 40;
      warnings.push("Rain/snow expected - slippery conditions");
    } else if (precipitation > 0.1) {
      score -= 20;
      warnings.push("Light precipitation possible");
    } else {
      score += 15;
      positives.push("No precipitation expected");
    }

    // Wind evaluation (critical for 14ers)
    if (windSpeed > 40) {
      score -= 50;
      warnings.push("Dangerous wind speeds - avoid exposed ridges");
    } else if (windSpeed > 25) {
      score -= 25;
      warnings.push("High winds - challenging conditions");
    } else if (windSpeed > 15) {
      score -= 10;
      warnings.push("Moderate winds");
    } else {
      score += 10;
      positives.push("Calm wind conditions");
    }

    // Weather condition evaluation
    const weatherInfo = this.getWeatherDescription(weatherCode);
    if (weatherInfo.condition === "Thunderstorm") {
      score -= 60;
      warnings.push("Thunderstorms - extremely dangerous on peaks");
    } else if (weatherInfo.condition === "Snow") {
      score -= 35;
      warnings.push("Snow conditions - avalanche risk possible");
    } else if (weatherInfo.condition === "Rain") {
      score -= 25;
      warnings.push("Rainy conditions - slippery rocks");
    } else if (
      weatherInfo.condition === "Clear" ||
      weatherInfo.condition === "Partly cloudy"
    ) {
      score += 15;
      positives.push("Good visibility expected");
    }

    // Cloud cover evaluation
    if (cloudCover < 30) {
      score += 5;
      positives.push("Clear skies for great views");
    } else if (cloudCover > 80) {
      score -= 10;
      warnings.push("Overcast - limited visibility");
    }

    // Altitude-specific adjustments
    if (elevation > 14000) {
      // Extra penalties for extreme altitude
      if (windSpeed > 20) score -= 10;
      if (lowTemp < 30) score -= 15;
    }

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine overall rating
    let rating, category;
    if (score >= 80) {
      rating = "Excellent";
      category = "excellent";
    } else if (score >= 65) {
      rating = "Good";
      category = "good";
    } else if (score >= 45) {
      rating = "Fair";
      category = "fair";
    } else if (score >= 25) {
      rating = "Poor";
      category = "poor";
    } else {
      rating = "Dangerous";
      category = "dangerous";
    }

    return {
      score,
      rating,
      category,
      warnings,
      positives,
      summary: this.getHikingSummary(rating, warnings, positives),
    };
  }

  getHikingSummary(rating, warnings, positives) {
    switch (rating) {
      case "Excellent":
        return "Perfect conditions for hiking a 14er!";
      case "Good":
        return "Good day for hiking with proper preparation.";
      case "Fair":
        return "Challenging conditions - experienced hikers only.";
      case "Poor":
        return "Not recommended for hiking.";
      case "Dangerous":
        return "Do not attempt - dangerous conditions.";
      default:
        return "Conditions assessment unavailable.";
    }
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

      // Process 7-day forecast with hiking conditions
      const sevenDayForecast = [];
      let bestHikingDay = { dayIndex: 0, score: 0 };

      for (let i = 0; i < 7; i++) {
        const dayData = {
          temperature_2m_max: forecast.daily.temperature_2m_max[i],
          temperature_2m_min: forecast.daily.temperature_2m_min[i],
          weather_code: forecast.daily.weather_code[i],
          precipitation_sum: forecast.daily.precipitation_sum[i],
          wind_speed_10m_max: forecast.daily.wind_speed_10m_max[i],
          wind_direction_10m_dominant:
            forecast.daily.wind_direction_10m_dominant[i],
          cloud_cover_mean: forecast.daily.cloud_cover_mean[i],
        };

        const hikingConditions = this.evaluateHikingConditions(
          dayData,
          mountain.elevation
        );
        const weatherInfo = this.getWeatherDescription(dayData.weather_code);

        const forecastDay = {
          dayIndex: i,
          high: Math.round(dayData.temperature_2m_max),
          low: Math.round(dayData.temperature_2m_min),
          condition: weatherInfo.condition,
          description: weatherInfo.description,
          icon: weatherInfo.icon,
          precipitation: Math.round(dayData.precipitation_sum * 10) / 10,
          windSpeed: Math.round(dayData.wind_speed_10m_max),
          windDirection: dayData.wind_direction_10m_dominant,
          cloudCover: Math.round(dayData.cloud_cover_mean),
          hiking: hikingConditions,
        };

        sevenDayForecast.push(forecastDay);

        // Track best hiking day (skip today for planning purposes)
        if (i > 0 && hikingConditions.score > bestHikingDay.score) {
          bestHikingDay = { dayIndex: i, score: hikingConditions.score };
        }
      }

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
        // Keep legacy format for compatibility
        today: {
          high: sevenDayForecast[0].high,
          low: sevenDayForecast[0].low,
        },
        tomorrow: {
          high: sevenDayForecast[1].high,
          low: sevenDayForecast[1].low,
        },
        dayAfter: {
          high: sevenDayForecast[2].high,
          low: sevenDayForecast[2].low,
        },
        // New 7-day forecast data
        sevenDayForecast,
        bestHikingDay: bestHikingDay.dayIndex,
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
