const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 1. Core Proxy Configuration
const kiometProxy = createProxyMiddleware({
  // TARGET: Point this to where your real Kiomet game server is hosted!
  // If it's running on your home computer, replace this with your public IP or ngrok tunnel.
  target: 'http://localhost:8443', 
  
  changeOrigin: true, // Needed for virtual cloud hosting like Render
  ws: true,           // CRITICAL: Enables built-in WebSocket proxying
  logLevel: 'debug'   // Helps you see traffic flow in your Render logs
});

// 2. Route all incoming requests through the proxy middleware
app.use('/', kiometProxy);

// 3. Start the Express App on the dynamic port Render provides
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Web Tunnel Proxy active on port ${PORT}`);
});

// 4. CRITICAL FIX: Manually bind the WebSocket upgrade handler
// Without this line, Render will drop the persistent game connection
server.on('upgrade', kiometProxy.upgrade); 
