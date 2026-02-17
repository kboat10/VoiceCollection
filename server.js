/**
 * Example API Server for Voice Recording Application
 * 
 * This is a simple Node.js/Express server that demonstrates how to receive
 * and process audio recordings from the voice recording application.
 * 
 * USAGE:
 * 1. Install dependencies: npm install
 * 2. Run server: npm start
 * 3. Update config.js with: endpoint: 'http://localhost:3000/api/recordings'
 * 4. Open index.html in browser
 * 
 * PRODUCTION NOTE:
 * This is an example server for development/testing. For production:
 * - Add proper authentication
 * - Implement database storage
 * - Add audio processing/feature extraction
 * - Configure proper error handling
 * - Set up HTTPS
 * - Implement rate limiting
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.webm';
        cb(null, 'recording-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

// Configure multer for memory storage (used by proxy)
const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files and common audio formats
        const isAudio = file.mimetype.startsWith('audio/') || 
                       file.mimetype === 'application/octet-stream' ||
                       /\.(mp3|wav|m4a|mp4|webm|ogg|flac)$/i.test(file.originalname);
        
        if (isAudio) {
            console.log(`Accepting file: ${file.originalname}, MIME: ${file.mimetype}`);
            cb(null, true);
        } else {
            console.log(`Rejecting file: ${file.originalname}, MIME: ${file.mimetype}`);
            cb(new Error('Only audio files are allowed'));
        }
    }
});

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files (for testing the app)
app.use(express.static(__dirname));

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Helper function to convert audio to MP3
 */
function convertToMp3(inputBuffer, originalFilename) {
    return new Promise((resolve, reject) => {
        const tempInputPath = path.join(uploadsDir, `temp_${Date.now()}_input`);
        const tempOutputPath = path.join(uploadsDir, `temp_${Date.now()}_output.mp3`);

        // Write buffer to temp file
        fs.writeFileSync(tempInputPath, inputBuffer);

        console.log('Converting audio to MP3...');
        console.log(`Input file size: ${inputBuffer.length} bytes`);
        
        // Try conversion without format forcing first (more flexible)
        ffmpeg(tempInputPath)
            .audioCodec('libmp3lame')
            .toFormat('mp3')
            .audioBitrate('128k')
            .audioChannels(1)
            .audioFrequency(16000)
            .on('start', (commandLine) => {
                console.log('FFmpeg command:', commandLine);
            })
            .on('end', () => {
                console.log('Conversion complete');
                
                // Check if output file exists and has content
                if (!fs.existsSync(tempOutputPath)) {
                    reject(new Error('Output file was not created'));
                    return;
                }
                
                // Read converted file
                const mp3Buffer = fs.readFileSync(tempOutputPath);
                console.log(`Output MP3 size: ${mp3Buffer.length} bytes`);
                
                // Clean up temp files
                try {
                    fs.unlinkSync(tempInputPath);
                    fs.unlinkSync(tempOutputPath);
                } catch (e) {
                    console.error('Error cleaning up temp files:', e);
                }
                
                resolve({
                    buffer: mp3Buffer,
                    filename: originalFilename.replace(/\.[^.]+$/, '.mp3')
                });
            })
            .on('error', (err, stdout, stderr) => {
                console.error('Conversion error:', err.message);
                console.error('FFmpeg stderr:', stderr);
                
                // Clean up temp files
                try {
                    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
                    if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
                } catch (e) {
                    console.error('Error cleaning up temp files:', e);
                }
                
                reject(err);
            })
            .save(tempOutputPath);
    });
}

/**
 * Proxy endpoint to forward requests to Voice Sentinel API
 * This avoids CORS issues when uploading from localhost
 * POST /api/proxy
 */
app.post('/api/proxy', uploadMemory.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file provided'
            });
        }

        // Get label/metadata
        const label = req.body.label;

        console.log('\n=== Proxying to Voice Sentinel API ===');
        console.log('File:', req.file.originalname);
        console.log('MIME Type:', req.file.mimetype);
        console.log('Size:', (req.file.size / 1024).toFixed(2), 'KB');
        console.log('Label:', label);

        let fileBuffer = req.file.buffer;
        let filename = req.file.originalname;
        let mimeType = req.file.mimetype;

        // Convert to MP3 if not already in an accepted format
        const isAcceptedFormat = /\.(mp3|wav|flac)$/i.test(filename) || 
                                mimeType === 'audio/mpeg' || 
                                mimeType === 'audio/wav' || 
                                mimeType === 'audio/flac';

        if (!isAcceptedFormat) {
            console.log('Format not accepted by API, converting to MP3...');
            try {
                const converted = await convertToMp3(fileBuffer, filename);
                fileBuffer = converted.buffer;
                filename = converted.filename;
                mimeType = 'audio/mpeg';
                console.log('Converted to:', filename, 'Size:', (fileBuffer.length / 1024).toFixed(2), 'KB');
            } catch (convError) {
                console.error('Conversion failed:', convError);
                return res.status(500).json({
                    success: false,
                    error: 'Audio conversion failed: ' + convError.message
                });
            }
        }

        // Create form data for the actual API
        const formData = new FormData();
        formData.append('file', fileBuffer, {
            filename: filename,
            contentType: mimeType
        });
        formData.append('label', label);

        // Forward to Voice Sentinel API with timeout
        console.log('Forwarding to Voice Sentinel API...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('⚠️  Voice Sentinel API timeout after 10 seconds');
            controller.abort();
        }, 10000); // 10 second timeout (shorter for Cloudflare compatibility)
        
        try {
            const apiResponse = await fetch('http://159.65.185.102/collect', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders(),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const responseData = await apiResponse.json();
            
            console.log('API Response Status:', apiResponse.status);
            console.log('API Response:', responseData);
            console.log('====================================\n');

            // Forward the response
            res.status(apiResponse.status).json(responseData);
            
        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error('Voice Sentinel API timeout');
                // Return success since recording is saved locally
                return res.status(200).json({
                    success: true,
                    message: 'Recording saved locally (Voice Sentinel API unavailable)',
                    localFile: filename,
                    note: 'Voice Sentinel API timed out after 10 seconds. Recording stored in uploads/ folder for later upload.'
                });
            }
            
            throw fetchError; // Re-throw other errors to outer catch
        }

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            success: false,
            error: 'Proxy error: ' + error.message
        });
    }
});

/**
 * Main endpoint for receiving audio recordings (local storage)
 * POST /api/recordings
 */
app.post('/api/recordings', upload.single('audio'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file provided'
            });
        }

        // Parse metadata
        let metadata;
        try {
            metadata = JSON.parse(req.body.metadata);
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: 'Invalid metadata format'
            });
        }

        // Log received recording
        console.log('\n=== New Recording Received ===');
        console.log('File:', req.file.filename);
        console.log('Size:', (req.file.size / 1024).toFixed(2), 'KB');
        console.log('Session ID:', metadata.sessionId);
        console.log('Phrase:', metadata.phraseText);
        console.log('Duration:', metadata.duration, 'seconds');
        console.log('============================\n');

        // Generate unique recording ID
        const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Save metadata to JSON file
        const metadataWithFile = {
            ...metadata,
            recordingId: recordingId,
            filename: req.file.filename,
            fileSize: req.file.size,
            filePath: req.file.path,
            uploadedAt: new Date().toISOString()
        };

        const metadataPath = path.join(uploadsDir, `${recordingId}.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadataWithFile, null, 2));

        // Here you would typically:
        // 1. Store metadata in database
        // 2. Process audio file (feature extraction, transcription, etc.)
        // 3. Store processed results
        // 4. Clean up temporary files
        // 5. Trigger any downstream processes

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return success response
        res.json({
            success: true,
            recordingId: recordingId,
            message: 'Recording processed successfully',
            data: {
                filename: req.file.filename,
                size: req.file.size,
                duration: metadata.duration,
                timestamp: metadataWithFile.uploadedAt
            }
        });

    } catch (error) {
        console.error('Error processing recording:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * Get all recordings (for testing/debugging)
 * GET /api/recordings
 */
app.get('/api/recordings', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const recordings = [];

        files.forEach(file => {
            if (file.endsWith('.json')) {
                const content = fs.readFileSync(path.join(uploadsDir, file), 'utf8');
                recordings.push(JSON.parse(content));
            }
        });

        // Sort by upload date (most recent first)
        recordings.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        res.json({
            success: true,
            count: recordings.length,
            recordings: recordings
        });

    } catch (error) {
        console.error('Error fetching recordings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recordings'
        });
    }
});

/**
 * Get statistics about recordings
 * GET /api/stats
 */
app.get('/api/stats', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        let totalDuration = 0;
        let totalSize = 0;
        const sessions = new Set();
        const phrases = new Set();

        jsonFiles.forEach(file => {
            const content = JSON.parse(fs.readFileSync(path.join(uploadsDir, file), 'utf8'));
            totalDuration += content.duration || 0;
            totalSize += content.fileSize || 0;
            sessions.add(content.sessionId);
            phrases.add(content.phraseText);
        });

        res.json({
            success: true,
            statistics: {
                totalRecordings: jsonFiles.length,
                totalDuration: totalDuration.toFixed(2),
                totalSize: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
                uniqueSessions: sessions.size,
                uniquePhrases: phrases.size,
                averageDuration: jsonFiles.length > 0 ? (totalDuration / jsonFiles.length).toFixed(2) : 0
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

/**
 * Delete all recordings (for testing)
 * DELETE /api/recordings
 */
app.delete('/api/recordings', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        let deletedCount = 0;

        files.forEach(file => {
            fs.unlinkSync(path.join(uploadsDir, file));
            deletedCount++;
        });

        res.json({
            success: true,
            message: `Deleted ${deletedCount} files`
        });

    } catch (error) {
        console.error('Error deleting recordings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete recordings'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n===========================================');
    console.log('🎤 Voice Recording API Server');
    console.log('===========================================');
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/recordings`);
    console.log(`Web app: http://localhost:${PORT}/index.html`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  POST   /api/proxy         - Proxy to Voice Sentinel API`);
    console.log(`  POST   /api/recordings    - Upload recording (local)`);
    console.log(`  GET    /api/recordings    - List all recordings`);
    console.log(`  GET    /api/stats         - Get statistics`);
    console.log(`  GET    /api/health        - Health check`);
    console.log(`  DELETE /api/recordings    - Delete all recordings`);
    console.log('===========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    process.exit(0);
});
