// Vercel Serverless Function - Proxy to Voice Sentinel API
// Note: Forwards requests directly without audio conversion
// Voice Sentinel API must accept WebM/MP4 formats

const fetch = require('node-fetch');

async function handler(req, res) {
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
    
    const startTime = Date.now();
    
    try {
        console.log('[Proxy] Request received at', new Date().toISOString());
        console.log('[Proxy] Content-Type:', req.headers['content-type']);
        
        // Read the raw body as a buffer with timeout
        const chunks = [];
        
        const bodyPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout reading request body'));
            }, 10000); // 10 second timeout
            
            req.on('data', (chunk) => {
                console.log('[Proxy] Received chunk:', chunk.length, 'bytes');
                chunks.push(chunk);
            });
            
            req.on('end', () => {
                clearTimeout(timeout);
                console.log('[Proxy] Body reading complete');
                resolve();
            });
            
            req.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
        
        await bodyPromise;
        
        const body = Buffer.concat(chunks);
        console.log('[Proxy] Total body size:', body.length, 'bytes');
        
        if (body.length === 0) {
            return res.status(400).json({ error: 'Empty request body' });
        }
        
        console.log('[Proxy] Forwarding to Voice Sentinel API at http://159.65.185.102/collect');
        
        // Forward to Voice Sentinel API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
        
        const apiResponse = await fetch('http://159.65.185.102/collect', {
            method: 'POST',
            headers: {
                'Content-Type': req.headers['content-type']
            },
            body: body,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const responseText = await apiResponse.text();
        const elapsed = Date.now() - startTime;
        
        console.log('[Proxy] Voice Sentinel Response Status:', apiResponse.status);
        console.log('[Proxy] Response time:', elapsed, 'ms');
        console.log('[Proxy] Response:', responseText.substring(0, 200));
        
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
        const elapsed = Date.now() - startTime;
        console.error('[Proxy] Error after', elapsed, 'ms:', error.message);
        console.error('[Proxy] Stack:', error.stack);
        
        if (error.name === 'AbortError') {
            return res.status(504).json({
                success: false,
                error: 'Gateway timeout - Voice Sentinel API did not respond in time',
                elapsed: elapsed
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Proxy error: ' + error.message,
            elapsed: elapsed,
            note: 'Check Vercel logs for details'
        });
    }
}

// Disable body parsing - we need the raw body
handler.config = {
    api: {
        bodyParser: false,
    },
};

module.exports = handler;
