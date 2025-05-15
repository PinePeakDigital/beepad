import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { WebSocketServer } from 'ws';

const app = new Hono();
const port = process.env.PORT || 3001;

// API routes will be mounted here
app.get('/', (c) => c.text('BeePad API'));

// Start the server
serve({
  fetch: app.fetch,
  port: Number(port),
}, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

// WebSocket server will be initialized here
