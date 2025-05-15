import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { query } from '../db';
import { createNote, getNoteBySlug } from '../db/models/note';

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server });
  const docs = new Map<string, Y.Doc>();

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const slug = url.pathname.slice(1); // Remove leading slash

    if (!slug) {
      ws.close(1008, 'Note slug required');
      return;
    }

    // Get or create Yjs document
    let doc = docs.get(slug);
    if (!doc) {
      doc = new Y.Doc();
      docs.set(slug, doc);

      // Get or create note in database
      let note = await getNoteBySlug(slug);
      if (!note) {
        note = await createNote(slug);
      }

      // Load state from database
      const result = await query(
        'SELECT state FROM y_docs WHERE doc_name = $1',
        [slug]
      );

      if (result.rows[0]?.state) {
        Y.applyUpdate(doc, result.rows[0].state);
      } else {
        await query(
          'INSERT INTO y_docs (doc_name) VALUES ($1)',
          [slug]
        );
      }

      // Save document state periodically
      const saveInterval = setInterval(async () => {
        const state = Y.encodeStateAsUpdate(doc);
        await query(
          'UPDATE y_docs SET state = $1, updated_at = NOW() WHERE doc_name = $2',
          [state, slug]
        );
      }, 5000);

      // Clean up on all clients disconnected
      const cleanup = () => {
        if (wss.clients.size === 0) {
          clearInterval(saveInterval);
          docs.delete(slug);
        }
      };

      ws.on('close', cleanup);
    }

    // Handle WebSocket messages
    ws.on('message', async (message: Buffer) => {
      try {
        const update = new Uint8Array(message);
        Y.applyUpdate(doc, update);
        
        // Broadcast to all clients except sender
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(message);
          }
        });
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });

    // Send initial document state
    const initialState = Y.encodeStateAsUpdate(doc);
    ws.send(initialState);
  });

  return wss;
}
