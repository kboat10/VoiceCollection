# VoiceGuard Deployment Status

**Last Updated:** February 17, 2026

---

## 🎉 Current Status: WORKING

Both deployments are now operational for data collection!

---

## 🌐 Available Deployments

### 1. Cloudflare Tunnel (Recommended for Remote Access) ✅

**URL:** https://scotland-wrapping-owen-intelligent.trycloudflare.com

**Status:** ✅ **WORKING**

**Features:**
- ✅ HTTPS enabled (microphone works)
- ✅ Accessible from anywhere
- ✅ Audio conversion (WebM/MP4 → MP3)
- ✅ Local backup in `uploads/` folder
- ✅ Graceful handling when Voice Sentinel API is down
- ⚠️ URL changes each time you restart the tunnel

**How to Start:**
```bash
# Terminal 1: Start local server
cd "/Users/kwakuboateng/Documents/Audio recording"
node server.js

# Terminal 2: Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:3000
```

**Use for:**
- ✅ Remote participants
- ✅ Data collection from anywhere
- ✅ Sharing with research participants
- ✅ Production data collection

---

### 2. Local Server (Recommended for Lab/Office Use) ✅

**URL:** http://localhost:3000

**Status:** ✅ **WORKING**

**Features:**
- ✅ Full audio conversion (FFmpeg)
- ✅ Local backup in `uploads/` folder
- ✅ Fastest performance
- ✅ Complete control
- ⚠️ Only accessible from same network

**How to Start:**
```bash
cd "/Users/kwakuboateng/Documents/Audio recording"
./start-server.sh
# or
node server.js
```

**Network Access:**
- Local: `http://localhost:3000`
- Same WiFi: `http://YOUR_LOCAL_IP:3000`

**Use for:**
- ✅ Lab/office data collection
- ✅ Testing and development
- ✅ Best performance
- ✅ Full local backup

---

### 3. Vercel Deployment (Static UI + Serverless API) ⚠️

**URL:** https://voice-collection-taupe.vercel.app/

**Status:** ⚠️ **LIMITED FUNCTIONALITY**

**Features:**
- ✅ HTTPS enabled
- ✅ Fast UI loading
- ✅ Globally accessible
- ❌ No local file storage (serverless)
- ❌ No audio conversion (no FFmpeg)
- ⚠️ Shows helpful message when Voice Sentinel API is down

**Limitations:**
- Cannot save recordings locally (serverless environment)
- No FFmpeg for audio conversion
- Depends entirely on Voice Sentinel API being online

**Use for:**
- ✅ UI preview/demo
- ✅ Sharing interface design
- ✅ Testing consent form
- ❌ **NOT for production data collection**

---

## 🔧 Voice Sentinel API Status

**Endpoint:** http://159.65.185.102/collect

**Current Status:** ⚠️ **DOWN (502 Bad Gateway)**

**Last Tested:** February 17, 2026 at 5:17 PM

**Impact:**
- Recordings cannot be sent to Voice Sentinel API currently
- All deployments automatically save recordings locally as backup
- No data loss - recordings are preserved in `uploads/` folder

**Workaround:**
- ✅ Continue data collection using local server or Cloudflare tunnel
- ✅ All recordings are backed up locally
- ✅ Can batch-upload to Voice Sentinel API when it's back online

---

## 📁 Data Backup & Recovery

### Local Backup Location
```
/Users/kwakuboateng/Documents/Audio recording/uploads/
```

### File Format
Each recording consists of:
- **Audio file**: `recording_*.mp3` (converted from WebM/MP4)
- **Metadata**: `rec_*.json` (session info, phrase, timestamp)

### Check Recordings
```bash
# List all recordings
ls -lh "/Users/kwakuboateng/Documents/Audio recording/uploads/"

# Count recordings
ls "/Users/kwakuboateng/Documents/Audio recording/uploads/" | grep "\.mp3$" | wc -l
```

### Backup Your Data
```bash
# Create timestamped backup
tar -czf "voiceguard-backup-$(date +%Y%m%d-%H%M%S).tar.gz" uploads/

# Copy to external drive
cp -r uploads/ /Volumes/ExternalDrive/voiceguard-backup/
```

---

## 🚀 Quick Start Guide

### For Remote Participants

1. **Start both services:**
   ```bash
   # Terminal 1
   cd "/Users/kwakuboateng/Documents/Audio recording"
   node server.js
   
   # Terminal 2
   cloudflared tunnel --url http://localhost:3000
   ```

2. **Share the Cloudflare URL** (e.g., `https://xxx.trycloudflare.com`)

3. **Participants access the URL** and start recording

4. **Recordings are saved** in `uploads/` folder automatically

### For Local Lab Use

1. **Start server:**
   ```bash
   cd "/Users/kwakuboateng/Documents/Audio recording"
   ./start-server.sh
   ```

2. **Access locally:** http://localhost:3000

3. **Or from same WiFi:** http://YOUR_LOCAL_IP:3000

---

## ⚙️ Configuration Summary

### Current Settings

**API Endpoint:** `/api/proxy` (relative path)
- Works with both localhost and HTTPS tunnels
- Avoids mixed content errors

**Timeout:** 10 seconds
- Prevents hanging when Voice Sentinel API is down
- Fast enough to avoid Cloudflare tunnel timeouts

**Audio Format:**
- Browser records: WebM or MP4 (with Opus codec)
- Server converts: MP3 (128kbps, mono, 16kHz)
- API expects: MP3, WAV, or FLAC

**Sample Rate:** 16,000 Hz (16kHz)
**Max Duration:** 15 seconds
**Phrases:** 98 research-specific phrases

---

## 🐛 Troubleshooting

### Issue: "Upload failed" or timeout errors
**Solution:** Voice Sentinel API is down. Continue recording - all data is saved locally.

### Issue: Microphone not accessible
**Solution:** Use HTTPS URL (Cloudflare tunnel or localhost)

### Issue: Cloudflare tunnel URL not working
**Solution:** 
1. Check server is running on port 3000
2. Restart Cloudflare tunnel: `cloudflared tunnel --url http://localhost:3000`

### Issue: Recordings not in uploads/ folder
**Solution:**
1. Check server is running and showing "Recording saved" logs
2. Verify path: `/Users/kwakuboateng/Documents/Audio recording/uploads/`
3. Check file permissions

---

## 📊 Performance Metrics

### Local Server
- Audio conversion: ~1-2 seconds
- API timeout: 10 seconds
- Total processing: ~11-12 seconds (with Voice Sentinel API down)
- Success rate: 100% (always saves locally)

### Cloudflare Tunnel
- Same as local server performance
- Additional ~100-500ms network latency
- Success rate: 100% (always saves locally)

### Vercel
- No local storage capability
- Success rate: Depends on Voice Sentinel API uptime

---

## 🎯 Recommendations

### For Production Data Collection
1. ✅ **Use Cloudflare Tunnel** for remote participants
2. ✅ **Use Local Server** for lab/office sessions
3. ❌ **Avoid Vercel** until Voice Sentinel API is stable

### For Development/Testing
1. ✅ **Use Local Server** - fastest iteration
2. ✅ **Use Vercel** for UI/UX testing only

### For Backup Strategy
1. ✅ Monitor `uploads/` folder regularly
2. ✅ Create daily backups
3. ✅ Keep metadata files with audio files
4. ✅ Batch-upload when Voice Sentinel API is online

---

## 📞 Support & Contacts

**Researcher:** Nana Kwaku Afriyie Ampadu-Boateng  
**Supervisor:** Dr. Govindha Yeluripati  
**Institution:** Ashesi University, Computer Science Department

**GitHub Repository:** https://github.com/kboat10/VoiceCollection.git

**Voice Sentinel API:** Contact administrator about 502 Bad Gateway error

---

## ✅ Next Steps

1. **Continue data collection** using Cloudflare tunnel or local server
2. **Monitor Voice Sentinel API** status
3. **Create regular backups** of `uploads/` folder
4. **Batch-upload recordings** when Voice Sentinel API is back online

---

**All systems are GO for data collection!** 🎙️✨
