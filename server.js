const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = 'https://crazygames.com'; 

const gameProxy = createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
    ws: true,
    xfwd: true, // Crucial: Forwards original client IP and protocol headers
    logLevel: 'debug',
    pathRewrite: {
        '^/game-tunnel': '',
    },
    onProxyRes: function (proxyRes, req, res) {
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        proxyRes.headers['access-control-allow-origin'] = '*';
        proxyRes.headers['access-control-allow-headers'] = '*';
    }
});

// 2. THEN DEFINE YOUR ROUTES
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
            <iframe src="/game-tunnel/"></iframe>
        </body>
        </html>
    `);
});

app.use('/game-tunnel', gameProxy);
app.use('*', gameProxy);

// 3. START THE SERVER
const server = app.listen(PORT, () => {
    console.log(`Proxy network engine live on port ${PORT}`);
});

server.on('upgrade', gameProxy.upgrade);
