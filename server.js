const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = 'https://www.kiomet.com'; 

const gameProxy = createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    secure: false,
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

const server = app.listen(PORT, () => {
    console.log(`Proxy network engine live on port ${PORT}`);
});

server.on('upgrade', gameProxy.upgrade);
<script>
  // Intercept the browser's WebSocket constructor
  const NativeWebSocket = window.WebSocket;
  
  window.WebSocket = function(url, protocols) {
    // If the game tries to connect to localhost or 127.0.0.1
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('ws://')) {
      console.log('Intercepted local WebSocket connection:', url);
      
      // Force it to use your secure Render address instead
      url = 'wss://test-2j3o.onrender.com';
    }
    
    // Pass the corrected URL to the native browser socket handler
    return new NativeWebSocket(url, protocols);
  };
</script>
