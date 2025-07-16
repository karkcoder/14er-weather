#!/usr/bin/env node

/**
 * Free Weather API Test Script
 * This script demonstrates how to use various free weather APIs
 * Run with: node test-weather-apis.js
 */

const axios = require("axios");

// Example coordinates for Mount Elbert (highest peak in Colorado)
const lat = 39.1178;
const lon = -106.4453;

async function testOpenMeteo() {
  console.log("\n🌤️  Testing Open-Meteo API (Currently used in the app)");
  console.log("====================================================");

  try {
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lon,
        current:
          "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m",
        daily: "temperature_2m_max,temperature_2m_min,weather_code",
        temperature_unit: "fahrenheit",
        wind_speed_unit: "mph",
        timezone: "America/Denver",
        forecast_days: 1,
      },
    });

    const data = response.data;
    console.log(
      `Current Temperature: ${Math.round(data.current.temperature_2m)}°F`
    );
    console.log(`Humidity: ${data.current.relative_humidity_2m}%`);
    console.log(`Wind Speed: ${Math.round(data.current.wind_speed_10m)} mph`);
    console.log(
      `Today's High: ${Math.round(data.daily.temperature_2m_max[0])}°F`
    );
    console.log(
      `Today's Low: ${Math.round(data.daily.temperature_2m_min[0])}°F`
    );
    console.log("✅ Open-Meteo API working perfectly!");
  } catch (error) {
    console.error("❌ Error with Open-Meteo API:", error.message);
  }
}

async function testNationalWeatherService() {
  console.log("\n🇺🇸 Testing National Weather Service API (US Only)");
  console.log("=================================================");

  try {
    // First, get the grid point
    const pointResponse = await axios.get(
      `https://api.weather.gov/points/${lat},${lon}`
    );
    const forecastUrl = pointResponse.data.properties.forecast;

    // Get the forecast
    const forecastResponse = await axios.get(forecastUrl);
    const forecast = forecastResponse.data.properties.periods[0];

    console.log(
      `Temperature: ${forecast.temperature}°${forecast.temperatureUnit}`
    );
    console.log(`Conditions: ${forecast.shortForecast}`);
    console.log(`Wind: ${forecast.windSpeed} ${forecast.windDirection}`);
    console.log(`Detailed Forecast: ${forecast.detailedForecast}`);
    console.log("✅ National Weather Service API working!");
  } catch (error) {
    console.error("❌ Error with National Weather Service API:", error.message);
  }
}

async function test7Timer() {
  console.log("\n⏰ Testing 7Timer API");
  console.log("=====================");

  try {
    const response = await axios.get("http://www.7timer.info/bin/api.pl", {
      params: {
        lon: lon,
        lat: lat,
        product: "astro",
        output: "json",
      },
    });

    const data = response.data;
    const current = data.dataseries[0];

    console.log(`Weather: ${current.weather}`);
    console.log(`Wind Speed: ${current.wind10m.speed} (on 1-8 scale)`);
    console.log(`Wind Direction: ${current.wind10m.direction}`);
    console.log(`Temperature: ${current.temp2m}°C`);
    console.log("✅ 7Timer API working!");
  } catch (error) {
    console.error("❌ Error with 7Timer API:", error.message);
  }
}

async function testWttrIn() {
  console.log("\n🌦️  Testing wttr.in API");
  console.log("=======================");

  try {
    const response = await axios.get(`https://wttr.in/${lat},${lon}?format=j1`);
    const data = response.data;

    const current = data.current_condition[0];
    const today = data.weather[0];

    console.log(`Temperature: ${current.temp_F}°F`);
    console.log(`Feels Like: ${current.FeelsLikeF}°F`);
    console.log(`Conditions: ${current.weatherDesc[0].value}`);
    console.log(`Humidity: ${current.humidity}%`);
    console.log(`Wind Speed: ${current.windspeedMiles} mph`);
    console.log(`Max Temp Today: ${today.maxtempF}°F`);
    console.log(`Min Temp Today: ${today.mintempF}°F`);
    console.log("✅ wttr.in API working!");
  } catch (error) {
    console.error("❌ Error with wttr.in API:", error.message);
  }
}

async function main() {
  console.log("🏔️  Testing Free Weather APIs for Mount Elbert");
  console.log("Coordinates:", lat, lon);

  await testOpenMeteo();
  await testNationalWeatherService();
  await test7Timer();
  await testWttrIn();

  console.log("\n🎉 Weather API testing complete!");
  console.log(
    "\nRecommendation: Open-Meteo is the best choice for your 14er weather app:"
  );
  console.log("- No API key required");
  console.log("- High-quality data");
  console.log("- Great for mountain weather");
  console.log("- Reliable and fast");
  console.log("- Already implemented in your app!");
}

main().catch(console.error);
