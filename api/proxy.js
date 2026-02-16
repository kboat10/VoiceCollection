// Vercel Serverless Function - Proxy to Voice Sentinel API
// Note: No audio conversion in serverless - Voice Sentinel API must accept WebM/MP4

const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
        // Parse multipart form data manually since Vercel doesn't support multer easily
        const contentType = req.headers['content-type'];
        
        if (!contentType || !contentType.includes('multipart/form-data')) {
            return res.status(400).json({ 
                error: 'Content-Type must be multipart/form-data' 
            });
        }
        
        console.log('Forwarding to Voice Sentinel API...');
        
        // Forward the request directly to Voice Sentinel API
        // Note: This forwards as-is without conversion
        const apiResponse = await fetch('http://159.65.185.102/collect', {
            method: 'POST',
            headers: {
                'Content-Type': contentType
            },
            body: req
        });
        
        const responseData = await apiResponse.json();
        
        console.log('Voice Sentinel API Response:', apiResponse.status);
        
        // Forward the response
        res.status(apiResponse.status).json(responseData);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            success: false,
            error: 'Proxy error: ' + error.message,
            note: 'Audio must be in mp3, wav, or flac format'
        });
    }
};
