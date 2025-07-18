# Colorado 14ers Weather App

A comprehensive weather application that displays current conditions and a 7-day forecast for all 60 Colorado peaks above 14,000 feet, with intelligent hiking condition analysis.

## Features

- **Complete 14ers Database**: All 60 Colorado fourteeners with accurate coordinates and elevations
- **Real-time Weather Data**: Current temperature, conditions, humidity, wind speed, and visibility
- **7-Day Weather Forecast**: Detailed weather forecast for the week ahead
- **Smart Hiking Analysis**: AI-powered evaluation of hiking conditions for each day
- **Best Day Highlighting**: Automatically identifies the optimal day for hiking each peak
- **Interactive Search**: Find specific mountains quickly
- **FREE Weather Data**: No API keys or configuration required!

## Hiking Condition Analysis

The app analyzes multiple weather factors to determine the best days for hiking 14ers:

### **Evaluation Criteria**

- **Temperature Range**: Ideal between 40-70°F, penalties for extreme cold/heat
- **Precipitation**: Heavy penalties for rain/snow, bonus for dry conditions
- **Wind Speed**: Critical for high-altitude safety, dangerous above 40mph
- **Weather Conditions**: Severe penalties for thunderstorms, snow, heavy rain
- **Cloud Cover**: Better scores for clear skies and good visibility
- **Altitude-Specific**: Extra penalties for extreme conditions above 14,000ft

### **Hiking Scores**

- **Excellent (80-100)**: Perfect conditions for hiking
- **Good (65-79)**: Good day with proper preparation
- **Fair (45-64)**: Challenging conditions, experienced hikers only
- **Poor (25-44)**: Not recommended for hiking
- **Dangerous (0-24)**: Do not attempt - dangerous conditions

### **Safety Features**

- ⚠️ **Weather Warnings**: Alerts for dangerous conditions like thunderstorms, high winds
- ✅ **Positive Indicators**: Highlights favorable conditions
- 🥾 **Best Day Badge**: Clearly marks the optimal hiking day for each mountain

## Weather Data Source

This app now uses **Open-Meteo** - a completely free weather API that requires no registration or API keys:

- ✅ **100% Free** - No cost, no limits for personal use
- ✅ **No Configuration** - Works immediately without setup
- ✅ **High Quality Data** - European weather model data
- ✅ **Mountain Weather** - Excellent for high-altitude locations

## Running the Static Version

After building the static version with `./build-static.sh`, you have several options:

### Option 1: Node.js Server (Recommended)

```bash
./run-static.sh
```

Then open http://localhost:3000

### Option 2: Python HTTP Server

```bash
./run-python-server.sh
```

Then open http://localhost:8080

### Option 3: Manual Server Start

```bash
cd build
npm install  # First time only
npm start    # Starts Node.js server on port 3000
```

**Important:** Don't open the HTML file directly in your browser using `file://` - this will show "Loading..." forever due to CORS restrictions. Always use a local HTTP server.

- ✅ **Reliable** - Professional-grade weather service

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Open your browser to `http://localhost:3000`

That's it! No API keys, no configuration needed.

## Alternative Free Weather APIs

If you want to try other free weather services, see [FREE_WEATHER_APIs.md](FREE_WEATHER_APIs.md) for a comprehensive list of options including:

- **Open-Meteo** (current) - Free, no API key
- **National Weather Service** - US government data, free, no API key
- **7Timer** - Free, no API key
- **wttr.in** - Simple, free, no API key
- **WeatherAPI** - Free tier with simple registration

## Testing Weather APIs

Run the test script to compare different free weather services:

```bash
node test-weather-apis.js
```

- **Sorting Options**: Sort by name, elevation, or current temperature
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern, clean interface with mountain-themed design

## Screenshot

The app displays weather cards for each 14er showing:

- Mountain name and elevation
- Current temperature and conditions
- Today's high/low temperatures
- Tomorrow's high/low temperatures
- Weather details (feels like, humidity, wind, visibility)

## API Endpoints

- `GET /api/mountains` - Get list of all Colorado 14ers
- `GET /api/weather` - Get weather data for all mountains
- `GET /api/weather/:mountainName` - Get weather data for a specific mountain

## Colorado 14ers Included

The app includes **60 Colorado fourteeners** - all peaks in Colorado above 14,000 feet:

### **Official 53 Fourteeners** (300+ feet prominence)

These peaks meet the official geological standard with at least 300 feet of topographic prominence:

**Highest Peaks:**

- Mount Elbert (14,440 ft) - Highest peak in Colorado
- Mount Massive (14,428 ft)
- Mount Harvard (14,421 ft)
- Blanca Peak (14,351 ft)
- La Plata Peak (14,343 ft)

**Popular Peaks:**

- Pikes Peak (14,115 ft) - Famous for its highway and cog railway
- Longs Peak (14,259 ft) - Rocky Mountain National Park
- Grays Peak (14,278 ft) - Popular beginner peak
- Torreys Peak (14,275 ft) - Often climbed with Grays
- Quandary Peak (14,271 ft) - Close to Breckenridge

**Technical Peaks:**

- Capitol Peak (14,137 ft) - Class 4 scrambling required
- Pyramid Peak (14,025 ft) - Challenging Elk Range peak
- Crestone Needle (14,203 ft) - Technical climbing
- Little Bear Peak (14,037 ft) - Dangerous approach

### **Additional 6 Peaks** (<300 feet prominence)

These peaks are commonly recognized by climbers but have less than 300 feet of topographic prominence:

- **El Diente Peak** (14,159 ft) - Popular San Juan peak
- **North Eolus** (14,039 ft) - Technical Needle Mountains peak
- **Conundrum Peak** (14,040 ft) - Elk Mountains
- **Sunlight Spire** (14,001 ft) - Needle Mountains spire

### **Updated Peak Information**

- **Mount Blue Sky** (14,271 ft) - Formerly Mount Evans (renamed in 2023)
- **Mount Cameron** (14,238 ft) - Included despite low prominence due to historical significance

_Total: 53 official + 7 additional = 60 fourteeners_

## Mountain Ranges Covered

- **Sawatch Range**: 15 peaks (including the 5 highest in Colorado)
- **Elk Mountains**: 12 peaks (including technical challenges)
- **Sangre de Cristo**: 10 peaks (including the Crestones)
- **Front Range**: 8 peaks (including Longs Peak and Grays/Torreys)
- **San Juan Mountains**: 7 peaks (including El Diente Peak)
- **Mosquito Range**: 5 peaks (including Mount Lincoln)
- **Needle Mountains**: 3 peaks (including North Eolus)

_All 60 peaks span Colorado's major mountain ranges and include both standard prominence peaks and commonly climbed sub-peaks._

## Data Completeness & Standards

This app includes the most comprehensive list of Colorado fourteeners available:

### **Two Recognition Standards**

1. **Official 53 Peaks**: Meet the geological standard of 300+ feet topographic prominence
2. **Climbing Community**: Additional 6 peaks commonly recognized by mountaineers

### **Data Accuracy**

- **Coordinates**: Precise latitude/longitude for accurate weather data
- **Elevations**: Official USGS elevations with recent updates
- **Names**: Current official names (including Mount Blue Sky rename)

### **Weather Coverage**

Each peak has been verified to provide reliable weather data from Open-Meteo's European weather model, ensuring accurate high-altitude forecasts for all Colorado fourteeners.

## Weather Data

The app provides comprehensive weather information:

- **Current Conditions**: Temperature, feels-like, humidity, wind speed/direction, visibility
- **Today's Forecast**: High and low temperatures
- **Tomorrow's Forecast**: High and low temperatures
- **Weather Icons**: Visual representation of current conditions
- **Real-time Updates**: Refresh button to get latest data

## Technical Details

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Weather API**: Open-Meteo (free, no API key required)
- **Responsive Design**: CSS Grid and Flexbox
- **Error Handling**: Graceful handling of API failures

## Development

The app is structured as follows:

```
14er-weather/
├── data/
│   └── fourteeners.js      # Mountain data with coordinates
├── public/
│   ├── index.html          # Frontend HTML
│   ├── styles.css          # CSS styling
│   └── script.js           # Frontend JavaScript
├── server.js               # Backend server
├── package.json            # Dependencies
└── README.md              # This file
```

## Contributing

To add new features or fix bugs:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this code for your own projects!

---

**Note**: This app requires an internet connection to fetch real-time weather data from Open-Meteo.
