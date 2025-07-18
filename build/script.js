class WeatherApp {
  constructor() {
    this.weatherData = [];
    this.filteredData = [];
    this.currentTheme = localStorage.getItem("theme") || "light";
    this.init();
  }

  init() {
    this.initTheme();
    this.loadWeatherData();
    this.setupEventListeners();
  }

  initTheme() {
    document.documentElement.setAttribute("data-theme", this.currentTheme);
    this.updateThemeIcon();
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", this.currentTheme);
    localStorage.setItem("theme", this.currentTheme);
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const themeIcon = document.querySelector(".theme-icon");
    themeIcon.textContent = this.currentTheme === "light" ? "🌙" : "☀️";
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme();
    });

    // Search functionality
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.filterData(e.target.value);
    });

    document.getElementById("searchBtn").addEventListener("click", () => {
      const searchTerm = document.getElementById("searchInput").value;
      this.filterData(searchTerm);
    });

    // Sort functionality
    document.getElementById("sortSelect").addEventListener("change", (e) => {
      this.sortData(e.target.value);
    });

    // Refresh button
    document.getElementById("refreshBtn").addEventListener("click", () => {
      this.loadWeatherData();
    });

    // Retry button
    document.getElementById("retryBtn").addEventListener("click", () => {
      this.loadWeatherData();
    });

    // Enter key support for search
    document.getElementById("searchInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const searchTerm = e.target.value;
        this.filterData(searchTerm);
      }
    });
  }

  async loadWeatherData() {
    try {
      this.showLoading();
      this.hideError();

      console.log(
        "Fetching weather data for all 14ers using Open-Meteo API..."
      );

      // Fetch weather for all mountains with rate limiting
      const weatherPromises = fourteeners.map((mountain, index) => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            const weather = await this.getWeatherForMountain(mountain);
            resolve(weather);
          }, index * 100); // 100ms delay between requests to be respectful
        });
      });

      this.weatherData = await Promise.all(weatherPromises);
      this.filteredData = [...this.weatherData];

      console.log("Weather data fetched successfully");
      this.hideLoading();
      this.renderWeatherCards();
    } catch (error) {
      console.error("Error loading weather data:", error);
      this.hideLoading();
      this.showError(error.message);
    }
  }

  async getWeatherForMountain(mountain) {
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${mountain.lat}&longitude=${mountain.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/Denver`
        ),
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${mountain.lat}&longitude=${mountain.lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/Denver&forecast_days=3`
        ),
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const current = await currentResponse.json();
      const forecast = await forecastResponse.json();

      return this.formatWeatherData(mountain, current, forecast);
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

  formatWeatherData(mountain, current, forecast) {
    // Get current weather info
    const currentWeather = this.getWeatherDescription(
      current.current.weather_code
    );

    // Get today's and tomorrow's forecast
    const todayIndex = 0;
    const tomorrowIndex = 1;

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
    };
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

  filterData(searchTerm) {
    if (!searchTerm.trim()) {
      this.filteredData = [...this.weatherData];
    } else {
      this.filteredData = this.weatherData.filter((mountain) =>
        mountain.mountain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    this.renderWeatherCards();
  }

  sortData(sortBy) {
    switch (sortBy) {
      case "name":
        this.filteredData.sort((a, b) => a.mountain.localeCompare(b.mountain));
        break;
      case "elevation":
        this.filteredData.sort((a, b) => b.elevation - a.elevation);
        break;
      case "temperature":
        this.filteredData.sort((a, b) => {
          const tempA = a.current ? a.current.temperature : -999;
          const tempB = b.current ? b.current.temperature : -999;
          return tempB - tempA;
        });
        break;
      case "windSpeed":
        this.filteredData.sort((a, b) => {
          const windA = a.current ? a.current.windSpeed : -1;
          const windB = b.current ? b.current.windSpeed : -1;
          return windB - windA;
        });
        break;
    }
    this.renderWeatherCards();
  }

  renderWeatherCards() {
    const weatherGrid = document.getElementById("weatherGrid");
    weatherGrid.innerHTML = "";

    if (this.filteredData.length === 0) {
      weatherGrid.innerHTML = `
        <div class="no-data">
          <p>No mountains found matching your search.</p>
        </div>
      `;
      return;
    }

    this.filteredData.forEach((mountain) => {
      const card = this.createWeatherCard(mountain);
      weatherGrid.appendChild(card);
    });
  }

  createWeatherCard(mountain) {
    const card = document.createElement("div");
    card.className = `weather-card ${mountain.error ? "error" : ""}`;

    if (mountain.error) {
      card.innerHTML = `
        <div class="card-header">
          <div>
            <div class="mountain-name">${mountain.mountain}</div>
            <div class="elevation">${mountain.elevation.toLocaleString()}ft</div>
          </div>
        </div>
        <div class="error-message">
          <p>${mountain.error}</p>
        </div>
      `;
    } else {
      const windDescription = this.getWindDescription(
        mountain.current.windDirection
      );

      card.innerHTML = `
        <div class="card-header">
          <div>
            <div class="mountain-name">${mountain.mountain}</div>
            <div class="elevation">${mountain.elevation.toLocaleString()}ft</div>
          </div>
          <div class="weather-icon">
            ${this.getWeatherEmoji(mountain.current.condition)}
          </div>
        </div>
        
        <div class="current-weather">
          <div class="current-temp">${mountain.current.temperature}°F</div>
          <div class="condition">${mountain.current.description}</div>
        </div>
        
        <div class="weather-details">
          <div class="detail-item">
            <span class="detail-label">Feels like:</span>
            <span class="detail-value">${mountain.current.feelsLike}°F</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Humidity:</span>
            <span class="detail-value">${mountain.current.humidity}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Wind:</span>
            <span class="detail-value wind-value">${
              mountain.current.windSpeed
            } mph</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Visibility:</span>
            <span class="detail-value">${mountain.current.visibility} mi</span>
          </div>
          ${
            mountain.current.windGusts
              ? `
            <div class="detail-item">
              <span class="detail-label">Gusts:</span>
              <span class="detail-value">${mountain.current.windGusts} mph</span>
            </div>
          `
              : ""
          }
          <div class="wind-description">${windDescription}</div>
        </div>
        
        <div class="forecasts">
          <div class="forecast-row">
            <span class="forecast-day">Today</span>
            <span class="forecast-temps">
              <span class="high-temp">${mountain.today.high}°</span>
              <span class="low-temp">${mountain.today.low}°</span>
            </span>
          </div>
          <div class="forecast-row">
            <span class="forecast-day">Tomorrow</span>
            <span class="forecast-temps">
              <span class="high-temp">${mountain.tomorrow.high}°</span>
              <span class="low-temp">${mountain.tomorrow.low}°</span>
            </span>
          </div>
        </div>
      `;
    }

    return card;
  }

  getWeatherEmoji(condition) {
    const emojiMap = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Fog: "🌫️",
    };
    return emojiMap[condition] || "🌤️";
  }

  getWindDescription(direction) {
    if (direction === null || direction === undefined) return "Variable";

    const directions = [
      "North",
      "NNE",
      "NE",
      "ENE",
      "East",
      "ESE",
      "SE",
      "SSE",
      "South",
      "SSW",
      "SW",
      "WSW",
      "West",
      "WNW",
      "NW",
      "NNW",
    ];

    const index = Math.round(direction / 22.5) % 16;
    return `${directions[index]} wind`;
  }

  showLoading() {
    document.getElementById("loading").style.display = "block";
    document.getElementById("weatherGrid").style.display = "none";
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("weatherGrid").style.display = "grid";
  }

  showError(message) {
    const errorDiv = document.getElementById("error");
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent = message;
    errorDiv.style.display = "block";
    document.getElementById("weatherGrid").style.display = "none";
  }

  hideError() {
    document.getElementById("error").style.display = "none";
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
