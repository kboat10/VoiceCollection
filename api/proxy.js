// Vercel Serverless Function - Proxy to Voice Sentinel API
// Note: Forwards requests directly without audio conversion
// Voice Sentinel API must accept WebM/MP4 formats

// Disable body parsing - we need the raw body
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
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
        
        // Read the raw body as a buffer
        const chunks = [];
        
        await new Promise((resolve, reject) => {
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => resolve());
            req.on('error', (err) => reject(err));
        });
        
        const body = Buffer.concat(chunks);
        console.log('Body size:', body.length, 'bytes');
        
        if (body.length === 0) {
            return res.status(400).json({ error: 'Empty request body' });
        }
        
        console.log('Forwarding to Voice Sentinel API...');
        
        // Forward to Voice Sentinel API
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
        return res.status(apiResponse.status).json(responseData);
        
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            success: false,
            error: 'Proxy error: ' + error.message,
            note: 'Check server logs for details'
        });
    }
}
