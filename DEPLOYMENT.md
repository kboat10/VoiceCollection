# Deployment Guide

This guide covers various deployment options for the Voice Recording Web Application.

## Table of Contents
1. [Local Development](#local-development)
2. [Static Hosting](#static-hosting)
3. [Full Stack Deployment](#full-stack-deployment)
4. [Cloud Platforms](#cloud-platforms)
5. [Security Considerations](#security-considerations)

---

## Local Development

### Option 1: Direct File Access (Simple Testing)

Just open `index.html` in your browser:
```bash
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

**Limitations:**
- Microphone access may be blocked (security)
- API calls may fail due to CORS
- Best for UI testing only

### Option 2: Python HTTP Server

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then visit: `http://localhost:8000`

### Option 3: Node.js http-server

```bash
# Install globally
npm install -g http-server

# Run server
http-server -p 8000 -c-1

# With HTTPS (for microphone access)
http-server -p 8000 -S -C cert.pem -K key.pem
```

### Option 4: Node.js Example Server (Included)

```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs on http://localhost:3000
# Web app: http://localhost:3000/index.html
# API: http://localhost:3000/api/recordings
```

**Features:**
- Full API implementation
- File upload handling
- Recording storage
- Statistics endpoint
- CORS enabled

---

## Static Hosting

For frontend-only deployment (requires separate API):

### Netlify

1. **Via Netlify CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

2. **Via Netlify Drop:**
- Visit https://app.netlify.com/drop
- Drag and drop project folder
- Done!

3. **Via Git:**
- Push code to GitHub
- Connect repository in Netlify dashboard
- Auto-deploys on push

**Configuration** (`netlify.toml`):
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Permissions-Policy = "microphone=(self)"
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### GitHub Pages

1. Create repository
2. Push code
3. Go to Settings → Pages
4. Select branch to deploy
5. Access at: `https://username.github.io/repo-name`

**Note:** Remember to update `config.js` with your API endpoint!

### AWS S3 + CloudFront

```bash
# Install AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://voice-recording-app

# Upload files
aws s3 sync . s3://voice-recording-app --exclude ".git/*"

# Enable static website hosting
aws s3 website s3://voice-recording-app --index-document index.html

# Set up CloudFront for HTTPS
# (Use AWS Console or CloudFormation)
```

---

## Full Stack Deployment

### Heroku

1. **Create `Procfile`:**
```
web: node server.js
```

2. **Deploy:**
```bash
# Login
heroku login

# Create app
heroku create voice-recording-app

# Deploy
git push heroku main

# Open app
heroku open
```

3. **Configure:**
```bash
# Set environment variables
heroku config:set NODE_ENV=production
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm install`
   - Run Command: `npm start`
3. Set environment variables
4. Deploy

### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js voice-recording-app

# Create environment
eb create voice-recording-env

# Deploy
eb deploy

# Open app
eb open
```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

**Build and run:**
```bash
# Build image
docker build -t voice-recording-app .

# Run container
docker run -p 3000:3000 voice-recording-app

# Or use Docker Compose
docker-compose up
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
```

---

## Cloud Platforms

### Google Cloud Platform (Cloud Run)

```bash
# Install gcloud CLI
gcloud init

# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/voice-recording-app

# Deploy to Cloud Run
gcloud run deploy voice-recording-app \
  --image gcr.io/PROJECT_ID/voice-recording-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure App Service

```bash
# Install Azure CLI
az login

# Create resource group
az group create --name voice-recording-rg --location eastus

# Create app service plan
az appservice plan create --name voice-recording-plan --resource-group voice-recording-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group voice-recording-rg --plan voice-recording-plan --name voice-recording-app --runtime "NODE|18-lts"

# Deploy
az webapp deployment source config-local-git --name voice-recording-app --resource-group voice-recording-rg

# Push code
git remote add azure <deployment-url>
git push azure main
```

---

## Security Considerations

### 1. HTTPS Setup

**Why:** Required for microphone access in production

**Let's Encrypt (Free SSL):**
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 2. Environment Variables

Never commit sensitive data. Use environment variables:

```bash
# .env file (don't commit!)
API_ENDPOINT=https://api.yourdomain.com/recordings
AUTH_TOKEN=your-secret-token
```

### 3. CORS Configuration

**Server-side (Node.js):**
```javascript
const cors = require('cors');

app.use(cors({
    origin: 'https://yourdomain.com',
    methods: ['POST', 'GET'],
    credentials: true
}));
```

### 4. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5. File Upload Security

```javascript
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Only allow audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});
```

### 6. Headers Security

```javascript
const helmet = require('helmet');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            mediaSrc: ["'self'", "blob:"],
            scriptSrc: ["'self'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true
    }
}));
```

---

## Post-Deployment Checklist

- [ ] HTTPS enabled
- [ ] API endpoint configured in `config.js`
- [ ] Microphone permissions working
- [ ] CORS properly configured
- [ ] File uploads working
- [ ] Error logging enabled
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Environment variables secured
- [ ] Domain configured
- [ ] SSL certificate valid
- [ ] Mobile testing completed
- [ ] Cross-browser testing done

---

## Monitoring & Maintenance

### Application Monitoring

```javascript
// Basic logging
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

### Performance Monitoring

- Use tools like New Relic, DataDog, or Google Analytics
- Monitor API response times
- Track error rates
- Monitor storage usage

### Database Backups

```bash
# Example: MongoDB backup
mongodump --uri="mongodb://localhost/recordings" --out=/backups/

# Automate with cron
0 2 * * * mongodump --uri="mongodb://localhost/recordings" --out=/backups/$(date +\%Y\%m\%d)
```

---

## Troubleshooting

### Issue: Microphone not accessible

**Solution:** Ensure HTTPS is enabled and permissions granted

### Issue: CORS errors

**Solution:** Configure CORS headers on API server

### Issue: Files not uploading

**Solution:** Check file size limits and multer configuration

### Issue: Slow performance

**Solution:** 
- Compress audio files
- Use CDN for static assets
- Optimize images and assets
- Enable gzip compression

---

## Support

For deployment issues:
1. Check server logs
2. Verify configuration
3. Test API independently
4. Check browser console

Need help? Open an issue or contact support.
