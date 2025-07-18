#!/bin/bash

echo "🚀 Starting 14er Weather App with Python server..."
echo ""

# Navigate to build directory
cd build

# Start Python HTTP server
echo "🌐 Starting server at http://localhost:8080"
echo "Press Ctrl+C to stop the server"
python3 -m http.server 8080
