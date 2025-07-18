// Test script to check if Open-Meteo API is accessible
async function testAPI() {
  try {
    console.log("Testing Open-Meteo API access...");

    // Test with Mount Elbert coordinates
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=39.1178&longitude=-106.4453&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America/Denver"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);
    console.log("✅ API is accessible");

    return data;
  } catch (error) {
    console.error("❌ API Error:", error.message);
    return null;
  }
}

// Run the test
testAPI();
