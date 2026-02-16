# Vercel Deployment Notes

## ⚠️ Important: Serverless Limitations

Vercel uses serverless functions which have some limitations compared to traditional servers:

### Audio Conversion
- **FFmpeg** doesn't work in Vercel's serverless environment
- Audio files are sent directly to the Voice Sentinel API
- The Voice Sentinel API must handle format conversion (WebM/MP4 → MP3)

### Recommended Setup

**Option 1: Voice Sentinel API Handles Conversion**
- Update your Voice Sentinel API to accept WebM/MP4 formats
- Or add conversion on the API side

**Option 2: Use a Different Hosting Service**
- For full FFmpeg support, deploy to:
  - Railway.app
  - Render.com
  - Heroku
  - DigitalOcean App Platform
  - AWS EC2 / Elastic Beanstalk

**Option 3: Use Vercel + External Conversion Service**
- Use a separate microservice for audio conversion
- Deploy conversion service on Railway/Render
- Vercel forwards to conversion service → Voice Sentinel API

## Current Deployment

The current Vercel deployment:
- ✅ Serves the web application (HTML, CSS, JS)
- ✅ Provides CORS proxy endpoint
- ⚠️ Does NOT convert audio formats
- ✅ Works for data collection if Voice Sentinel accepts WebM/MP4

## Testing

After deployment:
1. Visit your Vercel URL
2. Try recording a short sample
3. Check if Voice Sentinel API accepts the format
4. If not, implement one of the options above

## For Local Development

Run `npm start` to use the full-featured local server with FFmpeg conversion.
