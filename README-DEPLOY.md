# 🏔️ Colorado 14ers Weather App - Quick Deployment Guide

A minimalistic weather app for Colorado's 14,000+ foot peaks with light/dark theme support.

## 🚀 Quick Deploy (Static Version)

### Option 1: One-Click Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/14er-weather)

### Option 2: One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/14er-weather)

### Option 3: Manual Static Deployment

1. **Build static version:**

   ```bash
   ./build-static.sh
   ```

2. **Deploy to any static hosting:**
   - Upload the `build/` folder to your hosting service
   - Or use the hosting-specific commands below

## 🌐 Hosting Options

### Free Static Hosting (Recommended)

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
./build-static.sh
netlify deploy --dir=build --prod
```

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
./build-static.sh
cd build
vercel --prod
```

#### GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select source: Deploy from a branch
4. Choose main branch and /build folder
5. Your app will be available at `https://username.github.io/repository-name`

#### Cloudflare Pages

1. Connect your GitHub repository at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Build settings:
   - Build command: `./build-static.sh`
   - Build output directory: `build`
3. Deploy automatically on every push

### Paid Hosting Options

#### DigitalOcean App Platform

```bash
# Create app.yaml
cat > app.yaml << 'EOF'
name: 14er-weather
static_sites:
- name: frontend
  source_dir: build
  build_command: ./build-static.sh
  routes:
  - path: /
EOF

# Deploy
doctl apps create --spec app.yaml
```

#### AWS S3 + CloudFront

```bash
# Build static version
./build-static.sh

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Create CloudFront distribution (optional)
aws cloudfront create-distribution --distribution-config file://distribution.json
```

## 🛠️ Full Server Deployment (Node.js)

### Platform-as-a-Service

#### Heroku

```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
heroku create your-app-name
git push heroku main
```

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway link
railway up
```

#### Render

1. Connect your GitHub repository at [render.com](https://render.com)
2. Create a new Web Service
3. Build Command: `npm install`
4. Start Command: `npm start`

### VPS/Dedicated Server

#### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "14er-weather"
pm2 startup
pm2 save

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/14er-weather
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Configuration

### Environment Variables

```bash
# For full server deployment
PORT=3000
NODE_ENV=production
```

### Custom Domain Setup

1. **DNS Configuration:**

   ```
   Type: A
   Name: @
   Value: YOUR_SERVER_IP

   Type: CNAME
   Name: www
   Value: yourdomain.com
   ```

2. **SSL Certificate (Let's Encrypt):**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## 📊 Performance Optimization

### Static Version Benefits

- ✅ No server costs
- ✅ Global CDN delivery
- ✅ Automatic scaling
- ✅ 99.9% uptime
- ✅ Easy SSL setup

### Caching Strategy

```javascript
// Add to static-script.js for better performance
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const cachedData = localStorage.getItem("weatherCache");
const cacheTime = localStorage.getItem("cacheTime");

if (
  cachedData &&
  cacheTime &&
  Date.now() - parseInt(cacheTime) < CACHE_DURATION
) {
  // Use cached data
  this.weatherData = JSON.parse(cachedData);
  this.renderWeatherCards();
} else {
  // Fetch fresh data
  this.loadWeatherData();
}
```

## 🔍 Monitoring

### Health Checks

Add to your deployment:

```javascript
// Simple health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});
```

### Analytics

Add Google Analytics or similar:

```html
<!-- Add to index.html head -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors:** Enable CORS in your server configuration
2. **API Rate Limiting:** Add delays between API calls
3. **Mobile Responsive:** Test on multiple devices
4. **Cache Issues:** Use versioned assets or cache busting

### Debug Commands

```bash
# Check if app is running
curl -I http://localhost:3000

# Check logs
pm2 logs 14er-weather

# Check system resources
pm2 monit

# Restart app
pm2 restart 14er-weather
```

## 📱 Mobile Optimization

The app is fully responsive and works well on mobile devices. Key features:

- Touch-friendly interface
- Responsive grid layout
- Optimized for thumb navigation
- Fast loading on mobile networks

## 🔒 Security

### Headers

```javascript
// Add security headers
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
```

### Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

## 📋 Deployment Checklist

- [ ] Test app locally
- [ ] Configure environment variables
- [ ] Set up domain name
- [ ] Configure SSL certificate
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test on mobile devices
- [ ] Set up analytics (optional)
- [ ] Configure custom error pages
- [ ] Set up redirect rules

## 🎯 Recommended Deployment

For most users, we recommend the **static deployment to Netlify or Vercel**:

1. **Pros:**

   - Free hosting
   - Automatic HTTPS
   - Global CDN
   - Easy deployments
   - No server maintenance

2. **Cons:**
   - Limited to client-side functionality
   - API calls directly from browser

Choose the full server deployment if you need:

- Custom API endpoints
- Server-side caching
- Backend processing
- Database integration

## 📞 Support

If you need help with deployment:

1. Check the [full deployment guide](DEPLOYMENT.md)
2. Review common issues above
3. Create an issue on GitHub
4. Check the app logs for error messages

---

**Happy climbing! 🏔️**
