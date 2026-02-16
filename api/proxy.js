// Vercel Serverless Function - Proxy to Voice Sentinel API
// Simplified version without FFmpeg conversion

const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
        // Note: For Vercel deployment, we'll forward directly to the API
        // Audio conversion should be handled by the Voice Sentinel API
        // Or we need to use a different approach
        
        console.log('Proxy request received');
        
        // For now, return success to test deployment
        // You'll need to implement the actual forwarding logic
        res.status(200).json({
            status: 'success',
            message: 'Deployment successful - configure Voice Sentinel API forwarding',
            note: 'Audio conversion requires additional setup for serverless'
        });
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
