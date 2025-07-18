#!/bin/bash

echo "🚀 Starting 14er Weather App..."
echo ""

# Navigate to build directory
cd build

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🌐 Starting server at http://localhost:3000"
npm start
