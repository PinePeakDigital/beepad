import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { createServer } from 'http';
import { setupWebSocket } from './websocket';

const app = new Hono();
const port = process.env.PORT || 3001;

// API routes will be mounted here
app.get('/', (c) => c.text('BeePad API'));

// Create HTTP server
const server = createServer();

// Set up WebSocket server
const wss = setupWebSocket(server);

// Start the server
serve({
  fetch: app.fetch,
  port: Number(port),
  server,
}, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});
