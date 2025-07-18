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

      const response = await fetch("/api/weather");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch weather data");
      }

      this.weatherData = await response.json();
      this.filteredData = [...this.weatherData];

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

    // Get day names for forecast
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
                
                <div class="forecasts">
                    <div class="forecast-row">
                        <span class="forecast-day">Today</span>
                        <span class="forecast-temps">
                            <span class="high-temp">${
                              mountain.today.high
                            }°</span> / 
                            <span class="low-temp">${mountain.today.low}°</span>
                        </span>
                    </div>
                    ${tomorrowForecast}
                    ${dayAfterForecast}
                </div>
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
