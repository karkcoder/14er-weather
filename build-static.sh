#!/bin/bash

# Build script for static deployment
echo "Building static version of 14er Weather App..."

# Create build directory
mkdir -p build

# Copy static files
cp public/static-index.html build/index.html
cp public/static-script.js build/script.js
cp public/styles.css build/styles.css
cp public/fourteeners.js build/fourteeners.js

# Create a simple server.js for static hosting (optional)
cat > build/server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
});
EOF

# Create package.json for static deployment
cat > build/package.json << 'EOF'
{
  "name": "14er-weather-static",
  "version": "1.0.0",
  "description": "Static version of Colorado 14ers Weather App",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Create netlify.toml for Netlify deployment
cat > build/netlify.toml << 'EOF'
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Content-Security-Policy = "default-src 'self' https://api.open-meteo.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
EOF

# Create vercel.json for Vercel deployment
cat > build/vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

# Create _redirects for Netlify SPA routing
cat > build/_redirects << 'EOF'
/*    /index.html   200
EOF

echo "✅ Static build complete! Files are in the 'build' directory."
echo ""
echo "🚀 Deployment options:"
echo "1. Upload 'build' folder to any static hosting service"
echo "2. Use 'netlify deploy --dir=build' for Netlify"
echo "3. Use 'vercel --prod' in the build directory for Vercel"
echo "4. Push to GitHub and enable GitHub Pages"
echo ""
echo "📁 Build contents:"
ls -la build/
