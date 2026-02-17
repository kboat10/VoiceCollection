# VoiceGuard: Voice Data Collection for Deepfake Detection Research

A web application for collecting voice recordings as part of deepfake detection research at Ashesi University.

**Researcher:** Nana Kwaku Afriyie Ampadu-Boateng  
**Supervisor:** Dr. Govindha Yeluripati  
**Institution:** Ashesi University, Computer Science Department

---

## 🚀 Quick Start (Recommended for Data Collection)

### Option 1: Simple Startup (Recommended)

```bash
cd "Audio recording"
./start-server.sh
```

Then open your browser to `http://localhost:3000`

### Option 2: Manual Startup

```bash
cd "Audio recording"
npm install    # First time only
node server.js
```

---

## ⚠️ Important: Vercel vs Local Server

### Use Local Server For:
- ✅ **Actual data collection** (recordings sent to Voice Sentinel API)
- ✅ Audio conversion (WebM/MP4 → MP3)
- ✅ Reliable uploads
- ✅ Local backups in `uploads/` folder

### Vercel Deployment Issues:
- ❌ Voice Sentinel API times out from Vercel servers
- ❌ No FFmpeg (can't convert audio)
- ❌ 10-second serverless timeout
- ⚠️ **Use Vercel only for UI preview, NOT data collection**

**Vercel URL:** https://voice-collection-taupe.vercel.app/ (UI preview only)

---

## 📱 Features

### Core Features
- **Consent Management** - Detailed research consent form
- **Voice Recording** - High-quality audio capture (16kHz sample rate)
- **Research Mode** - 98 pre-defined phrases for participants to read
- **Waveform Visualization** - Real-time audio feedback
- **Session Management** - Automatic session recovery
- **Recent Recordings** - Local storage with replay and delete
- **Dark Mode** - Eye-friendly interface
- **Mobile-First Design** - Optimized for phones and tablets

### Technical Features
- **Audio Conversion** - Automatic conversion to API-compatible formats (MP3)
- **Metadata Collection** - Session ID, timestamps, duration, sample rate
- **Error Handling** - Graceful fallbacks and user-friendly messages
- **Data Backup** - Local copies saved in `uploads/` folder

---

## 📋 Requirements

### Required
- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **FFmpeg** - For audio conversion

### Install FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

---

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configuration

The app is pre-configured for the Voice Sentinel API. Configuration is in `config.js`:

```javascript
const CONFIG = {
    api: {
        endpoint: 'http://localhost:3000/api/proxy',  // Local proxy
        targetApi: 'http://159.65.185.102/collect'    // Voice Sentinel API
    },
    recording: {
        mimeType: 'audio/mp4',
        sampleRate: 16000
    }
    // ... more settings
};
```

### 3. Start Server

```bash
node server.js
```

Or use the startup script:

```bash
./start-server.sh
```

### 4. Access Application

**Local access:**
```
http://localhost:3000
```

**Network access (other devices on same WiFi):**
```
http://YOUR_LOCAL_IP:3000
```

Find your IP:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

---

## 📚 Documentation

- **[PRODUCTION-SETUP.md](PRODUCTION-SETUP.md)** - Complete production deployment guide
- **[VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md)** - Vercel limitations and issues
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - General deployment options

---

## 🔄 How It Works

### Data Flow

```
Browser Recording
    ↓
Local Server (localhost:3000)
    ↓
Audio Conversion (WebM/MP4 → MP3)
    ↓
Voice Sentinel API (159.65.185.102)
    ↓
Success Response
```

### Local Backup

All recordings are saved to `uploads/` folder:
- Audio file: `recording-{timestamp}-{id}.mp3`
- Metadata: `rec_{timestamp}_{id}.json`

---

## 🧪 Testing

### Test Recording
1. Open `http://localhost:3000`
2. Review and accept consent form
3. Click "Start Recording"
4. Read the displayed phrase
5. Click "Stop Recording"
6. Check `uploads/` folder for saved files
7. Check server logs for API response

### Expected Logs

```
[Proxy] Request received at 2026-02-17T16:00:00.000Z
[Proxy] Body size: 245678 bytes
Converting audio to MP3 format...
FFmpeg conversion successful
[Proxy] Voice Sentinel Response Status: 200
Recording saved successfully
```

---

## 🐛 Troubleshooting

### Microphone Not Accessible
- **Issue:** Browser requires HTTPS for microphone
- **Solution:** Use `localhost` or ngrok for HTTPS

### Recordings Not Uploading
- **Check:** Server logs for errors
- **Verify:** Voice Sentinel API is accessible
- **Check:** `uploads/` folder for local backups

### FFmpeg Errors
- **Issue:** FFmpeg not installed or not in PATH
- **Solution:** Install FFmpeg (see Requirements)
- **Verify:** Run `ffmpeg -version`

### Vercel Deployment Timeout
- **Issue:** Voice Sentinel API not responding from Vercel
- **Solution:** Use local server instead (see PRODUCTION-SETUP.md)

---

## 🔐 Security & Privacy

### Participant Data
- Consent required before any recording
- Session IDs anonymized
- Data used only for research purposes
- Confidentiality maintained per research protocol

### Technical Security
- HTTPS required for microphone access (use ngrok or localhost)
- No data stored in browser beyond session recovery
- Recent recordings only stored locally (can be cleared)

---

## 📊 Research Information

### Purpose
Collection of authentic voice samples for training and testing deepfake detection models.

### What Participants Do
- Review and sign consent form
- Record themselves reading pre-defined phrases
- Each recording is 5-10 seconds
- Total time: 10-15 minutes

### Data Collected
- Audio recordings (voice only)
- Metadata (timestamp, duration, sample rate)
- Session information (anonymized)

### Voluntary Participation
- Participation is completely voluntary
- Participants can withdraw at any time
- No penalty for withdrawal

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Web Audio API & MediaRecorder API
- Canvas API (waveform visualization)
- LocalStorage (session management)

### Backend
- Node.js + Express
- Multer (file uploads)
- FFmpeg (audio conversion)
- node-fetch (API proxy)

### Deployment
- Local: Node.js server
- Static UI: Vercel (preview only)
- Production: Local server required

---

## 📞 Support

For issues or questions about:
- **Research participation:** Contact Nana Kwaku Afriyie Ampadu-Boateng
- **Technical issues:** Check PRODUCTION-SETUP.md or open GitHub issue
- **API access:** Contact Voice Sentinel API administrator

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Supervisor:** Dr. Govindha Yeluripati, Ashesi University
- **Participants:** Thank you for contributing to deepfake detection research
- **Voice Sentinel API:** External API for voice data processing

---

**Last Updated:** February 17, 2026
