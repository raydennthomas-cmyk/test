const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// The target website we want to mirror completely
const TARGET_URL = 'https://kiomet.com'; 

// 1. Serve a clean frontend interface
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dynamic Portal</title>
            <style>
                body, html { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
                iframe { width:100%; height:100%; border:none; }
            </style>
        </head>
        <body>
            <!-- Bypasses Google's iframe limitations by using a clean local route -->
            <iframe src="/game-tunnel/"></iframe>
        </body>
        </html>
    `);
});

// 2. The Proxy Middleware Configuration
const gameProxy = createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,            // Forces the target server to think the request came from itself
    ws: true,                      // CRITICAL: Enables full WebSocket proxying for live multiplayer data
    logLevel: 'debug',
    onProxyRes: function (proxyRes, req, res) {
        // Automatically injects permissive CORS headers so browser scripts never block assets
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Headers'] = '*';
    }
});

// Route all requests under "/game-tunnel" directly through the proxy middleware
app.use('/game-tunnel', gameProxy);

// Start the server and map the HTTP upgrade head for WebSockets
const server = app.listen(PORT, () => {
    console.log(`Proxy network engine live on port ${PORT}`);
});

// Wire up the live WebSocket tunnel handshake
server.on('upgrade', gameProxy.upgrade); 
