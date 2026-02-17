// Vercel Serverless Function - Proxy to Voice Sentinel API
// Note: Forwards requests directly without audio conversion
// Voice Sentinel API must accept WebM/MP4 formats

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
        console.log('Proxy request received');
        console.log('Content-Type:', req.headers['content-type']);
        
        // In Vercel, we can't easily parse multipart/form-data
        // So we'll forward the entire request body directly to Voice Sentinel API
        
        // Get raw body buffer
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);
        
        console.log('Body size:', body.length, 'bytes');
        console.log('Forwarding to Voice Sentinel API...');
        
        // Use node-fetch to forward to Voice Sentinel API
        const fetch = (await import('node-fetch')).default;
        
        const apiResponse = await fetch('http://159.65.185.102/collect', {
            method: 'POST',
            headers: {
                'Content-Type': req.headers['content-type']
            },
            body: body
        });
        
        const responseText = await apiResponse.text();
        console.log('Voice Sentinel Response Status:', apiResponse.status);
        console.log('Voice Sentinel Response:', responseText.substring(0, 200));
        
        // Try to parse as JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = { status: 'error', message: responseText };
        }
        
        // Forward the response
        res.status(apiResponse.status).json(responseData);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            success: false,
            error: 'Proxy error: ' + error.message,
            note: 'Check server logs for details'
        });
    }
};
