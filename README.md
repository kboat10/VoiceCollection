# Voice Recording Web Application for Research Data Collection

A production-ready web application for collecting voice recordings from participants for research purposes. The application presents randomized phrases, records audio, and submits recordings to an API for feature extraction.

## Features

✅ **User-Friendly Interface**
- Clean, modern design optimized for quick recording sessions
- Mobile-responsive layout
- Clear visual feedback for recording states
- Progress tracking

✅ **Recording Functionality**
- Web Audio API integration
- Real-time waveform visualization
- Automatic quality checks
- Review and re-record options
- Maximum duration limits

✅ **Phrase Management**
- Randomized phrase presentation
- Prevention of order bias
- Skip functionality (optional)
- Break intervals for long sessions

✅ **API Integration**
- Automatic upload to feature extraction API
- Retry logic for failed uploads
- Comprehensive metadata collection
- Session tracking

✅ **Session Management**
- LocalStorage for session recovery
- Unique session IDs
- Progress persistence
- Demographic data collection (optional)

✅ **Error Handling**
- Microphone permission handling
- Network connectivity checks
- Browser compatibility checks
- User-friendly error messages

## Quick Start

### 1. Configuration

Edit `config.js` to customize the application:

```javascript
const CONFIG = {
    api: {
        endpoint: 'https://your-api-endpoint.com/api/recordings',
        authToken: '', // Add if authentication required
        timeout: 30000,
        retryAttempts: 3
    },
    recording: {
        maxDuration: 15,
        mimeType: 'audio/webm',
        sampleRate: 16000
    },
    phrases: [
        "Your phrase 1",
        "Your phrase 2",
        // Add all your research phrases here
    ]
};
```

### 2. API Endpoint Setup

Your API endpoint should accept POST requests with:

**Request Format:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `audio`: Audio file (blob)
  - `metadata`: JSON string containing:
    - `sessionId`: Unique session identifier
    - `phraseId`: Index of the phrase
    - `phraseText`: The actual phrase text
    - `timestamp`: Recording timestamp
    - `duration`: Recording duration in seconds
    - `audioFormat`: MIME type of audio
    - `sampleRate`: Audio sample rate
    - `projectId`: Your project identifier
    - `appVersion`: Application version

**Example metadata:**
```json
{
    "sessionId": "session_1708117200000_abc123xyz",
    "phraseId": 0,
    "phraseText": "The quick brown fox jumps over the lazy dog",
    "timestamp": 1708117200000,
    "duration": 3.5,
    "audioFormat": "audio/webm",
    "sampleRate": 16000,
    "projectId": "voice_research_2024",
    "appVersion": "1.0.0"
}
```

**Expected Response:**
```json
{
    "success": true,
    "recordingId": "unique-id",
    "message": "Recording processed successfully"
}
```

### 3. Deployment

#### Option A: Simple Local Testing

1. Open `index.html` in a web browser
2. Note: HTTPS required for microphone access (except localhost)

#### Option B: Deploy to Web Server

1. Upload all files to your web server
2. Ensure HTTPS is enabled
3. Configure CORS if API is on different domain

#### Option C: Use Python Simple Server

```bash
# Python 3
python -m http.server 8000

# Then visit http://localhost:8000
```

#### Option D: Use Node.js http-server

```bash
npm install -g http-server
http-server -p 8000
```

## File Structure

```
audio-recording/
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── config.js           # Configuration settings
├── app.js              # Core application logic
└── README.md           # This file
```

## Browser Compatibility

✅ **Supported Browsers:**
- Chrome 60+
- Firefox 55+
- Safari 14+
- Edge 79+

⚠️ **Requirements:**
- HTTPS connection (except localhost)
- Microphone permissions
- JavaScript enabled

## Customization Guide

### Adding Custom Phrases

Edit the `phrases` array in `config.js`:

```javascript
phrases: [
    "Your custom phrase 1",
    "Your custom phrase 2",
    "Your custom phrase 3",
    // Add as many as needed
]
```

### Adjusting Recording Duration

Modify in `config.js`:

```javascript
recording: {
    maxDuration: 15,  // Maximum seconds
    minDuration: 0.5  // Minimum seconds
}
```

### Changing Break Intervals

```javascript
ui: {
    breakAfterRecordings: 10  // Show break after N recordings
}
```

### Disabling Features

```javascript
ui: {
    showWaveform: false,      // Disable waveform visualization
    enablePracticeMode: false, // Disable practice recording
    allowSkip: false          // Disable skip button
}
```

### Custom Styling

Edit `styles.css` to change colors, fonts, and layout. Key CSS variables are at the top:

```css
:root {
    --primary-color: #4A90E2;
    --success-color: #28A745;
    --danger-color: #DC3545;
    /* ... more variables */
}
```

## API Integration Examples

### Example 1: Node.js/Express Backend

```javascript
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/recordings', upload.single('audio'), (req, res) => {
    const audioFile = req.file;
    const metadata = JSON.parse(req.body.metadata);
    
    // Process audio file
    // Extract features
    // Store in database
    
    res.json({ 
        success: true, 
        recordingId: generateId(),
        message: 'Recording processed successfully'
    });
});
```

### Example 2: Python/Flask Backend

```python
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

@app.route('/api/recordings', methods=['POST'])
def upload_recording():
    audio_file = request.files['audio']
    metadata = json.loads(request.form['metadata'])
    
    filename = secure_filename(audio_file.filename)
    audio_file.save(os.path.join('uploads', filename))
    
    # Process audio file
    # Extract features
    # Store in database
    
    return jsonify({
        'success': True,
        'recordingId': generate_id(),
        'message': 'Recording processed successfully'
    })
```

## Troubleshooting

### Microphone Not Working

1. Check browser permissions
2. Ensure HTTPS connection
3. Try different browser
4. Check system microphone settings

### Recordings Not Uploading

1. Verify API endpoint is correct
2. Check CORS configuration
3. Verify network connectivity
4. Check browser console for errors

### Audio Format Issues

If `audio/webm` isn't supported, the app will fallback to:
1. `audio/mp4`
2. Browser default

You can also manually set in `config.js`:

```javascript
recording: {
    mimeType: 'audio/mp4'  // or 'audio/wav'
}
```

## Privacy & Ethics

This application is designed for research purposes. Ensure you:

- ✅ Obtain proper IRB/ethics approval
- ✅ Provide informed consent
- ✅ Explain data usage clearly
- ✅ Anonymize participant data
- ✅ Store data securely
- ✅ Allow participants to withdraw
- ✅ Comply with data protection regulations (GDPR, etc.)

## Performance Optimization

### For Long Sessions

- Enable break intervals
- Reduce phrase count per session
- Implement batch uploads
- Use compression for audio files

### For Mobile Devices

- Test on actual devices
- Optimize for touch interactions
- Consider bandwidth limitations
- Implement offline support

## Advanced Features (Optional Enhancements)

Want to add more features? Consider:

- **Real-time audio level monitoring**
- **Automatic silence trimming**
- **Background noise detection**
- **Multi-language support**
- **Admin dashboard**
- **Export to CSV**
- **Audio quality metrics**
- **Progressive Web App (PWA)**

## Support & Contributing

For issues or questions:
1. Check browser console for errors
2. Verify configuration settings
3. Test API endpoint independently
4. Review browser compatibility

## License

This project is provided as-is for research purposes. Modify and use as needed for your research study.

## Version History

**v1.0.0** - Initial release
- Core recording functionality
- API integration
- Session management
- Practice mode
- Break intervals
- Error handling

---

**Built for Research** | **Privacy-Focused** | **Mobile-Ready**
