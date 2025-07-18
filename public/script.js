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
      this.totalCount = 60; // Based on actual count from fourteeners.js
      this.updateLoadingCounter();

      const response = await fetch("/api/weather");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch weather data");
      }

      this.weatherData = await response.json();
      this.filteredData = [...this.weatherData];

      // Update counter to show completion
      this.loadedCount = this.weatherData.length;
      this.updateLoadingCounter();

      this.hideLoading();
      this.renderWeatherCards();
    } catch (error) {
      console.error("Error loading weather data:", error);
      this.hideLoading();
      this.showError(error.message);
    }
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

  updateLoadingCounter() {
    const counterElement = document.getElementById("loadingCounter");
    if (counterElement) {
      counterElement.textContent = `${this.loadedCount} of ${this.totalCount}`;
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
    document.getElementById("error").style.display = "block";
    document.getElementById("errorMessage").textContent = message;
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
                day.condition,
                day.icon
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

  renderWeatherCards() {
    const grid = document.getElementById("weatherGrid");

    if (this.filteredData.length === 0) {
      grid.innerHTML =
        '<div class="no-data">No mountains found matching your search.</div>';
      return;
    }

    grid.innerHTML = this.filteredData
      .map((mountain) => {
        if (mountain.error) {
          return this.createErrorCard(mountain);
        }
        return this.createWeatherCard(mountain);
      })
      .join("");
  }

  createWeatherCard(mountain) {
    const windInfo = this.formatWindDisplay(mountain);

    // Generate 7-day forecast HTML
    const sevenDayForecastHtml = this.generateSevenDayForecast(mountain);

    return `
            <div class="weather-card">
                <div class="card-header">
                    <div>
                        <div class="mountain-name">${mountain.mountain}</div>
                        <div class="elevation">${mountain.elevation.toLocaleString()} ft</div>
                    </div>
                    <div class="weather-icon">
                        ${this.getWeatherEmoji(
                          mountain.current.condition,
                          mountain.current.icon
                        )}
                    </div>
                </div>
                
                <div class="current-weather">
                    <div class="current-temp">${
                      mountain.current.temperature
                    }°F</div>
                    <div class="condition">${mountain.current.description}</div>
                </div>
                
                <div class="weather-details">
                    <div class="detail-item">
                        Feels like: <span class="detail-value">${
                          mountain.current.feelsLike
                        }°F</span>
                    </div>
                    <div class="detail-item">
                        Humidity: <span class="detail-value">${
                          mountain.current.humidity
                        }%</span>
                    </div>
                    <div class="detail-item">
                        Wind: <span class="detail-value wind-value">${
                          windInfo.speed
                        }</span>
                    </div>
                    <div class="detail-item">
                        <span class="wind-description">${
                          windInfo.description
                        }</span>
                    </div>
                    <div class="detail-item">
                        Visibility: <span class="detail-value">${
                          mountain.current.visibility
                        } mi</span>
                    </div>
                </div>
                
                ${sevenDayForecastHtml}
            </div>
        `;
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

    const tomorrowForecast =
      mountain.tomorrow.high !== null && mountain.tomorrow.low !== null
        ? `<div class="forecast-row">
                <span class="forecast-day">${tomorrowName}</span>
                <span class="forecast-temps">
                    <span class="high-temp">${mountain.tomorrow.high}°</span> / 
                    <span class="low-temp">${mountain.tomorrow.low}°</span>
                </span>
            </div>`
        : `<div class="forecast-row"><span class="forecast-day">${tomorrowName}</span><span class="forecast-temps">No data</span></div>`;

    const dayAfterForecast =
      mountain.dayAfter &&
      mountain.dayAfter.high !== null &&
      mountain.dayAfter.low !== null
        ? `<div class="forecast-row">
                <span class="forecast-day">${dayAfterName}</span>
                <span class="forecast-temps">
                    <span class="high-temp">${mountain.dayAfter.high}°</span> / 
                    <span class="low-temp">${mountain.dayAfter.low}°</span>
                </span>
            </div>`
        : `<div class="forecast-row"><span class="forecast-day">${dayAfterName}</span><span class="forecast-temps">No data</span></div>`;

    return `
      <div class="forecasts">
        <div class="forecast-row">
          <span class="forecast-day">Today</span>
          <span class="forecast-temps">
            <span class="high-temp">${mountain.today.high}°</span> / 
            <span class="low-temp">${mountain.today.low}°</span>
          </span>
        </div>
        ${tomorrowForecast}
        ${dayAfterForecast}
      </div>
    `;
  }

  createErrorCard(mountain) {
    return `
            <div class="weather-card error">
                <div class="card-header">
                    <div>
                        <div class="mountain-name">${mountain.mountain}</div>
                        <div class="elevation">${mountain.elevation.toLocaleString()} ft</div>
                    </div>
                    <div class="weather-icon">❌</div>
                </div>
                <div class="current-weather">
                    <div class="condition" style="color: #c53030;">${
                      mountain.error
                    }</div>
                </div>
            </div>
        `;
  }

  getWeatherEmoji(condition, icon) {
    const conditionMap = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Snow: "❄️",
      Thunderstorm: "⛈️",
      Drizzle: "🌦️",
      Mist: "🌫️",
      Fog: "🌫️",
      Haze: "🌫️",
    };

    // Use icon code for more specific conditions
    if (icon) {
      if (icon.includes("01")) return "☀️"; // clear sky
      if (icon.includes("02")) return "⛅"; // few clouds
      if (icon.includes("03")) return "☁️"; // scattered clouds
      if (icon.includes("04")) return "☁️"; // broken clouds
      if (icon.includes("09")) return "🌧️"; // shower rain
      if (icon.includes("10")) return "🌦️"; // rain
      if (icon.includes("11")) return "⛈️"; // thunderstorm
      if (icon.includes("13")) return "❄️"; // snow
      if (icon.includes("50")) return "🌫️"; // mist
    }

    return conditionMap[condition] || "🌤️";
  }

  getWindDirection(degrees) {
    if (degrees === undefined || degrees === null) return "";

    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  getWindDirectionArrow(degrees) {
    if (degrees === undefined || degrees === null) return "";

    const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
    const index = Math.round(degrees / 45) % 8;
    return arrows[index];
  }

  getWindDescription(speed) {
    if (speed === undefined || speed === null) return "";

    if (speed < 1) return "Calm";
    if (speed < 4) return "Light air";
    if (speed < 8) return "Light breeze";
    if (speed < 13) return "Gentle breeze";
    if (speed < 19) return "Moderate breeze";
    if (speed < 25) return "Fresh breeze";
    if (speed < 32) return "Strong breeze";
    if (speed < 39) return "Near gale";
    if (speed < 47) return "Gale";
    if (speed < 55) return "Strong gale";
    if (speed < 64) return "Storm";
    return "Hurricane force";
  }

  formatWindDisplay(mountain) {
    const windSpeed = mountain.current.windSpeed;
    const windDirection = this.getWindDirection(mountain.current.windDirection);
    const windArrow = this.getWindDirectionArrow(
      mountain.current.windDirection
    );
    const windGusts = mountain.current.windGusts;
    const windDescription = this.getWindDescription(windSpeed);

    let windDisplay = `${windSpeed} mph`;

    if (windDirection && windArrow) {
      windDisplay += ` ${windArrow} ${windDirection}`;
    }

    if (windGusts && windGusts > windSpeed + 3) {
      windDisplay += ` (gusts ${windGusts})`;
    }

    return {
      speed: windDisplay,
      description: windDescription,
    };
  }
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
