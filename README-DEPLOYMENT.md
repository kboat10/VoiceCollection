# VoiceGuard Data Collection App

A web application for collecting voice recordings to help develop deepfake audio detection systems.

## 🎯 Project Information

**Research Title:** Deepfake Audio Detection System Development  
**Researcher:** Nana Kwaku Afriyie Ampadu-Boateng  
**Institution:** Ashesi University  
**Supervisor:** Dr. Govindha Yeluripati

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser
http://localhost:3000
```

### Environment Variables

Create a `.env` file (optional):

```env
PORT=3000
NODE_ENV=production
```

## 📦 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Configuration

The app is configured with:
- **API Proxy:** Handles CORS and forwards to Voice Sentinel API
- **Audio Conversion:** Automatically converts recordings to MP3
- **Mobile-First UI:** Optimized for all devices

## 🎤 Features

- ✅ Comprehensive consent form with research details
- ✅ Real-time waveform visualization
- ✅ Research mode with randomized phrases
- ✅ Audio format conversion (WebM/MP4 → MP3)
- ✅ Dark/Light theme support
- ✅ Mobile-responsive design
- ✅ Recent recordings management

## 🔧 Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js, Express
- **Audio Processing:** FFmpeg
- **API:** RESTful endpoints
- **Hosting:** Vercel

## 📝 API Endpoints

- `POST /api/proxy` - Upload recordings (with conversion)
- `POST /api/recordings` - Local recording storage
- `GET /api/recordings` - List all recordings
- `GET /api/stats` - Get statistics
- `GET /api/health` - Health check

## 🔒 Privacy & Ethics

All recordings are:
- Anonymized with unique session IDs
- Stored securely
- Used only for research purposes
- Participants can withdraw at any time

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contact

For questions about this research project, please contact:
- Nana Kwaku Afriyie Ampadu-Boateng
- Ashesi University
