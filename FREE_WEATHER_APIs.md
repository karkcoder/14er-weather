# Free Weather APIs (No Configuration Required)

This document lists excellent free weather APIs that require no API keys or configuration.

## 1. Open-Meteo (Currently Implemented) ⭐ RECOMMENDED

**Why it's great:**

- ✅ Completely free forever
- ✅ No API key required
- ✅ No rate limits for personal use
- ✅ High-quality European weather model data
- ✅ Supports historical, current, and forecast data
- ✅ Great for mountain weather

**API Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Example Usage:**

```javascript
const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
  params: {
    latitude: 39.3506,
    longitude: -106.9374,
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "America/Denver",
  },
});
```

## 2. 7Timer! (Alternative Option)

**Why it's good:**

- ✅ Free
- ✅ No API key
- ✅ Numerical weather prediction
- ✅ Good for outdoor activities

**API Endpoint:** `http://www.7timer.info/bin/api.pl`

**Example Usage:**

```javascript
const response = await axios.get("http://www.7timer.info/bin/api.pl", {
  params: {
    lon: -106.9374,
    lat: 39.3506,
    product: "astro", // or 'civil', 'civillight'
    output: "json",
  },
});
```

## 3. WeatherAPI Free Tier (Requires Simple Registration)

**Why it's decent:**

- ✅ 1 million free calls per month
- ❌ Requires free account (but no credit card)
- ✅ Good data quality
- ✅ Real-time and forecast

**API Endpoint:** `http://api.weatherapi.com/v1/current.json`

## 4. National Weather Service (US Only)

**Why it's excellent for US locations:**

- ✅ Completely free
- ✅ No API key required
- ✅ Official US government data
- ✅ Very reliable
- ❌ US locations only

**API Endpoint:** `https://api.weather.gov/`

**Example Usage:**

```javascript
// First get the grid point
const pointResponse = await axios.get(
  `https://api.weather.gov/points/${lat},${lon}`
);
const forecastUrl = pointResponse.data.properties.forecast;

// Then get the forecast
const forecastResponse = await axios.get(forecastUrl);
```

## 5. wttr.in (Fun Console Weather)

**Why it's fun:**

- ✅ Free
- ✅ No API key
- ✅ Simple text/JSON output
- ✅ Great for quick checks

**API Endpoint:** `https://wttr.in/`

**Example Usage:**

```javascript
// Get JSON weather data
const response = await axios.get("https://wttr.in/Denver?format=j1");

// Or get a simple text format
const response = await axios.get("https://wttr.in/Denver?format=3");
```

## How to Switch Between APIs

To switch from Open-Meteo to another API, modify the `WeatherService` class in `server.js`:

### For National Weather Service:

```javascript
class WeatherService {
  constructor() {
    this.baseUrl = "https://api.weather.gov";
  }

  async getCurrentWeather(lat, lon) {
    try {
      const pointResponse = await axios.get(
        `${this.baseUrl}/points/${lat},${lon}`
      );
      const forecastUrl = pointResponse.data.properties.forecast;
      const response = await axios.get(forecastUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching weather:", error.message);
      throw error;
    }
  }
}
```

### For 7Timer:

```javascript
class WeatherService {
  constructor() {
    this.baseUrl = "http://www.7timer.info/bin/api.pl";
  }

  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          lon: lon,
          lat: lat,
          product: "astro",
          output: "json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching weather:", error.message);
      throw error;
    }
  }
}
```

## Performance Tips

1. **Rate Limiting**: Even though these APIs are free, be respectful with request rates
2. **Caching**: Consider caching responses for a few minutes to reduce API calls
3. **Error Handling**: Always implement proper error handling and fallbacks
4. **Data Processing**: Weather codes and formats differ between APIs, so you'll need to map them

## Current Implementation

Your app is now configured to use **Open-Meteo** which is the best free option available. It provides:

- Current weather conditions
- Temperature, humidity, wind speed/direction
- Weather descriptions and conditions
- 3-day forecast with high/low temperatures
- All in Fahrenheit and mph units for the US market

No configuration or API keys needed - just run your app!
