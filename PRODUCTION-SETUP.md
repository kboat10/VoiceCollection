# Production Setup Guide

## Recommended: Local Server for Data Collection

The Voice Sentinel API is only accessible from certain IP addresses and does not respond reliably from Vercel's serverless environment. For production data collection, use the local server setup.

## Setup Instructions

### 1. Start the Local Server

```bash
cd "/Users/kwakuboateng/Documents/Audio recording"
node server.js
```

You should see:
```
Server running on http://localhost:3000
API endpoint available at http://localhost:3000/api/proxy
Ready to accept recordings!
```

### 2. Access the Application

**Option A: Same Computer**
- Open your browser to `http://localhost:3000`
- Click "Advanced" → "Proceed" if you see security warnings
- Grant microphone permissions when prompted

**Option B: Other Devices on Same Network**
1. Find your computer's local IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```
   Look for something like `192.168.1.XXX`

2. On your mobile device or other computer:
   - Connect to the same WiFi network
   - Open browser to `http://192.168.1.XXX:3000` (replace with your IP)
   - Grant microphone permissions

### 3. Share via ngrok (Optional - For Remote Access)

If participants need to access from different networks:

1. Install ngrok:
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. Start ngrok tunnel:
   ```bash
   ngrok http 3000
   ```

3. Share the HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - ✅ Works from anywhere
   - ✅ HTTPS enabled (required for microphone)
   - ✅ No configuration needed

## How It Works

### Local Server Benefits
1. **Audio Conversion** - Converts browser recordings (WebM/MP4) to MP3 using FFmpeg
2. **API Proxy** - Forwards requests to Voice Sentinel API, bypassing CORS
3. **Local Backup** - Saves all recordings to `uploads/` folder
4. **Reliable** - No serverless timeout issues

### Data Flow
```
Browser → Local Server (port 3000) → FFmpeg Conversion → Voice Sentinel API (159.65.185.102)
                ↓
          uploads/ folder (backup)
```

## Vercel Deployment (Static UI Only)

The Vercel deployment at `https://voice-collection-taupe.vercel.app/` serves the UI only and **will not work** for actual recording submissions because:

1. ❌ Voice Sentinel API times out from Vercel servers
2. ❌ No FFmpeg available in serverless (can't convert audio)
3. ❌ 10-second function timeout (Voice Sentinel takes longer)

**Use Vercel deployment for:**
- ✅ Previewing the UI
- ✅ Sharing the interface design
- ✅ Testing consent form flow
- ❌ **Not for actual data collection**

## Troubleshooting

### Microphone Not Working
- **Cause:** Browser requires HTTPS for microphone access
- **Solution:** Use `https://` via ngrok or accept localhost security exception

### "Network Error" When Recording
- **Cause:** Server not running or wrong URL
- **Solution:** Verify server is running at `http://localhost:3000`

### Recordings Saved Locally But Not Sent to API
- **Check:** Look in `uploads/` folder for `.json` and audio files
- **Verify:** Server logs show "Voice Sentinel API Response"
- **Issue:** If logs show errors, Voice Sentinel API might be down

### Voice Sentinel API Returns "Format not recognised"
- **Cause:** Browser sent incompatible format
- **Solution:** Server automatically converts to MP3 (check FFmpeg is installed)

## FFmpeg Installation (Required)

The server needs FFmpeg to convert audio:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

Verify installation:
```bash
ffmpeg -version
```

## Security Notes

### For Local Network Access
- Firewall might block port 3000 - allow it in settings
- Router might have client isolation - disable it temporarily

### For ngrok Access
- Free ngrok URLs change each restart
- Consider ngrok paid plan for permanent URLs
- Keep ngrok tunnel running during data collection sessions

## Monitoring

### Server Logs
Watch the terminal where `node server.js` is running:
- `[Proxy] Request received` - New recording started
- `[Proxy] Body size: X bytes` - Recording uploaded
- `Converting audio to MP3 format...` - FFmpeg conversion
- `Voice Sentinel API Response: 200` - Successfully sent to API

### Storage
- All recordings saved to `uploads/` folder
- Each recording has:
  - Audio file (`.mp3` or original format)
  - Metadata JSON file (`.json`)

## Backup Your Data

Important recordings are in `uploads/` folder:

```bash
# Create backup
tar -czf voiceguard-backup-$(date +%Y%m%d).tar.gz uploads/

# Or copy to external drive
cp -r uploads/ /Volumes/ExternalDrive/voiceguard-backup/
```
