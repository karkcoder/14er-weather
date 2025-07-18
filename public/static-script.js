class WeatherApp {
  constructor() {
    this.weatherData = [];
    this.filteredData = [];
    this.currentTheme = localStorage.getItem("theme") || "light";
    this.loadedCount = 0;
    this.totalCount = 0;
    this.init();

    // Make app instance available globally for modal functions
    window.weatherApp = this;
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

      // Reset counters
      this.loadedCount = 0;
      this.totalCount = fourteeners.length;
      this.updateLoadingCounter();

      console.log(
        `Fetching weather data for all ${this.totalCount} 14ers using Open-Meteo API...`
      );

      // Fetch weather for all mountains with rate limiting
      const weatherPromises = fourteeners.map((mountain, index) => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            const weather = await this.getWeatherForMountain(mountain);
            this.loadedCount++;
            this.updateLoadingCounter();
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
          `https://api.open-meteo.com/v1/forecast?latitude=${mountain.lat}&longitude=${mountain.lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,cloud_cover_mean&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/Denver&forecast_days=7`
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

    // Create 7-day forecast with hiking analysis
    const sevenDayForecast = [];
    let bestHikingDay = 0;
    let bestHikingScore = 0;

    for (let i = 0; i < 7; i++) {
      const dayData = {
        high: Math.round(forecast.daily.temperature_2m_max[i]),
        low: Math.round(forecast.daily.temperature_2m_min[i]),
        condition: this.getWeatherDescription(forecast.daily.weather_code[i])
          .condition,
        description: this.getWeatherDescription(forecast.daily.weather_code[i])
          .description,
        icon: this.getWeatherDescription(forecast.daily.weather_code[i]).icon,
        precipitation: forecast.daily.precipitation_sum[i] || 0,
        windSpeed: Math.round(forecast.daily.wind_speed_10m_max[i] || 0),
        cloudCover: Math.round(forecast.daily.cloud_cover_mean[i] || 0),
      };

      // Calculate hiking score
      const hikingAnalysis = this.calculateHikingScore(
        dayData,
        mountain.elevation
      );
      dayData.hiking = hikingAnalysis;

      // Track best hiking day (skip today for "best day" badge)
      if (i > 0 && hikingAnalysis.score > bestHikingScore) {
        bestHikingScore = hikingAnalysis.score;
        bestHikingDay = i;
      }

      sevenDayForecast.push(dayData);
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
      sevenDayForecast: sevenDayForecast,
      bestHikingDay: bestHikingDay,
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

  calculateHikingScore(dayData, elevation) {
    let score = 100; // Start with perfect score
    const positives = [];
    const warnings = [];

    // Temperature scoring (ideal range: 45-75°F at summit)
    const avgTemp = (dayData.high + dayData.low) / 2;
    if (avgTemp >= 45 && avgTemp <= 75) {
      positives.push("Comfortable temperatures");
    } else if (avgTemp < 32) {
      score -= 30;
      warnings.push("Freezing temperatures expected");
    } else if (avgTemp < 45) {
      score -= 15;
      warnings.push("Cold conditions");
    } else if (avgTemp > 85) {
      score -= 20;
      warnings.push("Very hot conditions");
    }

    // Precipitation scoring
    if (dayData.precipitation === 0) {
      positives.push("No precipitation expected");
    } else if (dayData.precipitation < 0.1) {
      score -= 5;
      positives.push("Minimal precipitation");
    } else if (dayData.precipitation < 0.25) {
      score -= 15;
      warnings.push("Light precipitation possible");
    } else if (dayData.precipitation < 0.5) {
      score -= 25;
      warnings.push("Moderate precipitation expected");
    } else {
      score -= 40;
      warnings.push("Heavy precipitation expected");
    }

    // Wind scoring (14ers are exposed!)
    if (dayData.windSpeed <= 15) {
      positives.push("Light winds");
    } else if (dayData.windSpeed <= 25) {
      score -= 10;
      warnings.push("Moderate winds");
    } else if (dayData.windSpeed <= 35) {
      score -= 25;
      warnings.push("Strong winds expected");
    } else {
      score -= 40;
      warnings.push("Dangerous wind conditions");
    }

    // Cloud cover scoring (affects views and lightning risk)
    if (dayData.cloudCover <= 25) {
      positives.push("Clear skies expected");
    } else if (dayData.cloudCover <= 50) {
      positives.push("Partly cloudy conditions");
    } else if (dayData.cloudCover <= 75) {
      score -= 10;
      warnings.push("Mostly cloudy");
    } else {
      score -= 15;
      warnings.push("Overcast conditions");
    }

    // Weather condition specific adjustments
    switch (dayData.condition) {
      case "Clear":
        positives.push("Excellent visibility");
        break;
      case "Thunderstorm":
        score -= 50;
        warnings.push("Thunderstorm risk - avoid exposed peaks");
        break;
      case "Snow":
        score -= 30;
        warnings.push("Snow conditions - bring appropriate gear");
        break;
      case "Rain":
        score -= 20;
        warnings.push("Wet conditions expected");
        break;
      case "Fog":
        score -= 25;
        warnings.push("Poor visibility conditions");
        break;
    }

    // Elevation adjustments (higher peaks = harsher conditions)
    if (elevation > 14200) {
      score -= 5;
      warnings.push("Very high elevation - extra caution needed");
    }

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine category and rating
    let category, rating;
    if (score >= 80) {
      category = "excellent";
      rating = "Excellent";
    } else if (score >= 65) {
      category = "good";
      rating = "Good";
    } else if (score >= 45) {
      category = "fair";
      rating = "Fair";
    } else if (score >= 25) {
      category = "poor";
      rating = "Poor";
    } else {
      category = "dangerous";
      rating = "Dangerous";
    }

    // Generate summary
    let summary;
    if (score >= 80) {
      summary = "Perfect conditions for hiking this 14er!";
    } else if (score >= 65) {
      summary = "Good hiking conditions with minor concerns.";
    } else if (score >= 45) {
      summary = "Acceptable conditions but be prepared.";
    } else if (score >= 25) {
      summary = "Challenging conditions - consider postponing.";
    } else {
      summary = "Dangerous conditions - do not attempt.";
    }

    return {
      score: Math.round(score),
      category,
      rating,
      summary,
      positives,
      warnings,
    };
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

      // Generate 7-day forecast HTML
      const sevenDayForecastHtml = this.generateSevenDayForecast(mountain);

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
        
        ${sevenDayForecastHtml}
      `;
    }

    return card;
  }

  generateSevenDayForecast(mountain) {
    if (!mountain.sevenDayForecast) {
      // Fallback to old 3-day format if new data not available
      return this.generateLegacyForecast(mountain);
    }

    const mountainId = mountain.mountain.replace(/\s+/g, "-").toLowerCase();

    // Generate button to open modal
    let forecastHtml = '<div class="seven-day-forecast">';
    forecastHtml += `
      <button class="forecast-button" onclick="window.weatherApp.openForecastModal('${mountainId}', '${mountain.mountain}')">
        <span>📅</span>
        <span>View 7-Day Forecast & Hiking Conditions</span>
      </button>
    `;
    forecastHtml += "</div>";

    return forecastHtml;
  }

  generateHikingDetails(hiking) {
    let detailsHtml = "";

    if (hiking.positives.length > 0 || hiking.warnings.length > 0) {
      detailsHtml += '<div class="hiking-details">';

      if (hiking.positives.length > 0) {
        detailsHtml += '<div class="hiking-positives">';
        hiking.positives.forEach((positive) => {
          detailsHtml += `<div class="hiking-point positive">✅ ${positive}</div>`;
        });
        detailsHtml += "</div>";
      }

      if (hiking.warnings.length > 0) {
        detailsHtml += '<div class="hiking-warnings">';
        hiking.warnings.forEach((warning) => {
          detailsHtml += `<div class="hiking-point warning">⚠️ ${warning}</div>`;
        });
        detailsHtml += "</div>";
      }

      detailsHtml += "</div>";
    }

    return detailsHtml;
  }

  generateLegacyForecast(mountain) {
    // Keep old 3-day format for backwards compatibility
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const tomorrowName = dayNames[tomorrow.getDay()];
    const dayAfterName = dayNames[dayAfter.getDay()];

    return `
      <div class="forecasts">
        <div class="forecast-row">
          <span class="forecast-day">Today</span>
          <span class="forecast-temps">
            <span class="high-temp">${mountain.today.high}°</span> / 
            <span class="low-temp">${mountain.today.low}°</span>
          </span>
        </div>
        <div class="forecast-row">
          <span class="forecast-day">${tomorrowName}</span>
          <span class="forecast-temps">
            <span class="high-temp">${mountain.tomorrow.high}°</span> / 
            <span class="low-temp">${mountain.tomorrow.low}°</span>
          </span>
        </div>
        <div class="forecast-row">
          <span class="forecast-day">${dayAfterName}</span>
          <span class="forecast-temps">
            <span class="high-temp">${mountain.dayAfter.high}°</span> / 
            <span class="low-temp">${mountain.dayAfter.low}°</span>
          </span>
        </div>
      </div>
    `;
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

  updateLoadingCounter() {
    const counterElement = document.getElementById("loadingCounter");
    if (counterElement) {
      counterElement.textContent = `${this.loadedCount} of ${this.totalCount}`;
      console.log(`Loading progress: ${this.loadedCount}/${this.totalCount}`);
    }
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

  openForecastModal(mountainId, mountainName) {
    // Find the mountain data
    const mountain = this.weatherData.find((m) => m.mountain === mountainName);
    if (!mountain || !mountain.sevenDayForecast) {
      console.error("Mountain data not found:", mountainName);
      return;
    }

    // Create modal if it doesn't exist
    let modal = document.getElementById("forecastModal");
    if (!modal) {
      modal = this.createForecastModal();
      document.body.appendChild(modal);
    }

    // Update modal content
    this.updateModalContent(modal, mountain);

    // Show modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  closeForecastModal() {
    const modal = document.getElementById("forecastModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = ""; // Restore scrolling
    }
  }

  createForecastModal() {
    const modal = document.createElement("div");
    modal.id = "forecastModal";
    modal.className = "modal-overlay";

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title" id="modalTitle">7-Day Forecast</h2>
          <button class="modal-close" onclick="window.weatherApp.closeForecastModal()">×</button>
        </div>
        <div class="modal-body" id="modalBody">
          <!-- Content will be populated dynamically -->
        </div>
      </div>
    `;

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeForecastModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeForecastModal();
      }
    });

    return modal;
  }

  updateModalContent(modal, mountain) {
    const modalTitle = modal.querySelector("#modalTitle");
    const modalBody = modal.querySelector("#modalBody");

    modalTitle.textContent = `${mountain.mountain} - 7-Day Forecast & Hiking Conditions`;

    const today = new Date();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    let contentHtml = "";

    mountain.sevenDayForecast.forEach((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const dayName =
        index === 0
          ? "Today"
          : index === 1
          ? "Tomorrow"
          : dayNames[date.getDay()];

      const isBestDay = index === mountain.bestHikingDay && index > 0;
      const hiking = day.hiking;

      contentHtml += `
        <div class="modal-forecast-day ${
          isBestDay ? "best-hiking-day" : ""
        } hiking-${hiking.category}">
          <div class="forecast-day-header">
            <div class="day-info">
              <span class="day-name">${dayName}</span>
              ${
                isBestDay
                  ? '<span class="best-day-badge">🥾 Best for Hiking!</span>'
                  : ""
              }
            </div>
            <div class="day-temps">
              <span class="high-temp">${day.high}°</span> / 
              <span class="low-temp">${day.low}°</span>
            </div>
          </div>
          
          <div class="forecast-details">
            <div class="weather-summary">
              <span class="weather-icon-small">${this.getWeatherEmoji(
                day.condition
              )}</span>
              <span class="weather-desc">${day.description}</span>
            </div>
            
            <div class="conditions-grid">
              <div class="condition-item">
                <span class="condition-icon">💧</span>
                <span>${day.precipitation.toFixed(1)}"</span>
              </div>
              <div class="condition-item">
                <span class="condition-icon">💨</span>
                <span>${day.windSpeed} mph</span>
              </div>
              <div class="condition-item">
                <span class="condition-icon">☁️</span>
                <span>${day.cloudCover}%</span>
              </div>
            </div>
            
            <div class="hiking-assessment">
              <div class="hiking-score">
                <span class="score-label">Hiking Score:</span>
                <span class="score-value score-${hiking.category}">${
        hiking.score
      }/100</span>
                <span class="score-rating">${hiking.rating}</span>
              </div>
              <div class="hiking-summary">${hiking.summary}</div>
              ${this.generateHikingDetails(hiking)}
            </div>
          </div>
        </div>
      `;
    });

    modalBody.innerHTML = contentHtml;
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
