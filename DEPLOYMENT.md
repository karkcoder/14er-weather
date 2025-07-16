# 14er Weather App - Deployment Guide

This guide covers multiple deployment options for the Colorado 14ers Weather App, from static hosting to full server deployments.

## Table of Contents

1. [Static Deployment (Client-Side Only)](#static-deployment)
2. [Full-Stack Deployment (Node.js Server)](#full-stack-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Domain Setup](#domain-setup)
5. [SSL/HTTPS Configuration](#ssl-https-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Static Deployment (Client-Side Only)

### Option 1: Convert to Static HTML/JS App

For the simplest deployment, you can convert the app to a purely client-side application that fetches weather data directly from the Open-Meteo API.

#### Step 1: Create Static Version

Create a new `public/fourteeners.js` file:

```javascript
// Copy the fourteeners data from data/fourteeners.js
const fourteeners = [
  // ... your fourteeners data
];
```

#### Step 2: Modify `script.js` to fetch directly from Open-Meteo

```javascript
// Replace the server API calls with direct Open-Meteo API calls
async loadWeatherData() {
  try {
    this.showLoading();
    this.hideError();

    // Fetch weather for all mountains directly from Open-Meteo
    const weatherPromises = fourteeners.map(async (mountain) => {
      try {
        const [currentResponse, forecastResponse] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${mountain.lat}&longitude=${mountain.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/Denver`),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${mountain.lat}&longitude=${mountain.lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/Denver&forecast_days=3`)
        ]);

        const current = await currentResponse.json();
        const forecast = await forecastResponse.json();

        return this.formatWeatherData(mountain, current, forecast);
      } catch (error) {
        return {
          mountain: mountain.name,
          elevation: mountain.elevation,
          error: "Weather data unavailable"
        };
      }
    });

    this.weatherData = await Promise.all(weatherPromises);
    this.filteredData = [...this.weatherData];
    this.hideLoading();
    this.renderWeatherCards();
  } catch (error) {
    this.hideLoading();
    this.showError(error.message);
  }
}
```

#### Step 3: Deploy to Static Hosting

**Netlify:**

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop your `public/` folder
3. Or connect GitHub repository for automatic deployments

**Vercel:**

1. Create account at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Deploy with zero configuration

**GitHub Pages:**

1. Push your code to GitHub
2. Go to Settings → Pages
3. Select source branch (main)
4. Your app will be available at `https://username.github.io/repository-name`

**Cloudflare Pages:**

1. Create account at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub repository
3. Deploy automatically

---

## Full-Stack Deployment (Node.js Server)

### Option 1: Platform-as-a-Service (PaaS)

#### Heroku

1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: node server.js
   ```
3. Deploy:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

#### Railway

1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy automatically

#### Render

1. Create account at [render.com](https://render.com)
2. Connect GitHub repository
3. Configure build settings:
   - Build Command: `npm install`
   - Start Command: `npm start`

### Option 2: Virtual Private Server (VPS)

#### Prerequisites

- VPS with Ubuntu/Debian
- Domain name
- SSH access

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Step 2: Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/14er-weather.git
cd 14er-weather

# Install dependencies
npm install

# Create production environment file
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start server.js --name "14er-weather"
pm2 startup
pm2 save
```

#### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/14er-weather`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/14er-weather /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

#### Create docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
```

#### Deploy

```bash
docker-compose up -d
```

---

## Environment Configuration

### Required Environment Variables

Create `.env` file:

```bash
NODE_ENV=production
PORT=3000
# Add any additional API keys if needed
```

### Production Optimizations

#### Add to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'",
    "postinstall": "echo 'Installation complete'"
  }
}
```

---

## Domain Setup

### DNS Configuration

Point your domain to your server:

**For VPS:**

```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A
Name: www
Value: YOUR_SERVER_IP
```

**For CDN/Static Hosting:**

```
Type: CNAME
Name: @
Value: your-app.netlify.app (or similar)

Type: CNAME
Name: www
Value: your-app.netlify.app
```

---

## SSL/HTTPS Configuration

### For VPS (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### For Static Hosting

Most static hosting providers (Netlify, Vercel, etc.) provide SSL certificates automatically.

---

## Monitoring and Maintenance

### Health Checks

Add to your `server.js`:

```javascript
// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

### Logging

Add logging middleware:

```javascript
const morgan = require("morgan");

// Add to dependencies
app.use(morgan("combined"));
```

### Performance Monitoring

```javascript
// Add response time tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});
```

### Backup Strategy

1. **Code**: Use Git for version control
2. **Data**: The app uses external APIs, so no database backup needed
3. **Configuration**: Keep `.env` files secure and backed up

---

## Troubleshooting

### Common Issues

1. **CORS Issues**: Make sure your server allows cross-origin requests
2. **API Rate Limits**: Implement caching and rate limiting
3. **Memory Issues**: Monitor memory usage with PM2
4. **SSL Certificate Renewal**: Set up automatic renewal

### Debug Commands

```bash
# Check application logs
pm2 logs 14er-weather

# Monitor performance
pm2 monit

# Restart application
pm2 restart 14er-weather

# Check Nginx status
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates
```

---

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **HTTPS**: Always use SSL in production
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Input Validation**: Validate all user inputs
5. **Regular Updates**: Keep dependencies updated

---

## Cost Considerations

### Static Hosting (Cheapest)

- **Netlify**: Free tier available
- **Vercel**: Free tier available
- **GitHub Pages**: Free for public repos

### PaaS Hosting (Medium Cost)

- **Heroku**: ~$7/month for basic dyno
- **Railway**: ~$5/month for basic plan
- **Render**: ~$7/month for basic plan

### VPS Hosting (Variable Cost)

- **DigitalOcean**: ~$5/month for basic droplet
- **Linode**: ~$5/month for basic plan
- **AWS EC2**: ~$10/month for t3.micro

---

## Conclusion

Choose the deployment method that best fits your needs:

- **Static Hosting**: Best for simple deployment, lowest cost
- **PaaS**: Best for ease of use, moderate cost
- **VPS**: Best for full control, variable cost
- **Docker**: Best for scalability and consistency

The 14er Weather App is designed to be flexible and can be deployed using any of these methods depending on your requirements and budget.
