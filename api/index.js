// Vercel Serverless Function - Main API Handler
// This serves the static files and handles basic routes

module.exports = async (req, res) => {
    const { method, url } = req;
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Health check
    if (url === '/api/health') {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'VoiceGuard API is running'
        });
        return;
    }
    
    // Redirect root to index.html
    if (url === '/' || url === '/api') {
        res.setHeader('Location', '/index.html');
        res.status(302).end();
        return;
    }
    
    res.status(404).json({ error: 'Not Found' });
};
