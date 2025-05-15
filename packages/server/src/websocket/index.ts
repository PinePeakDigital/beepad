import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { db as defaultDb } from '../db';
import { yDocs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createNote, getNoteBySlug } from '../db/models/note';
import { IncomingMessage } from 'http';
import { PostgresJsDatabase, BetterSQLite3Database } from 'drizzle-orm/postgres-js';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

type Database = PostgresJsDatabase | BetterSQLite3Database;

export function setupWebSocket(server: any, db: Database = defaultDb) {
  const wss = new WebSocketServer({ server });
  const docs = new Map<string, Y.Doc>();

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    console.log('WebSocket connection established');
    const url = new URL(req.url || '', 'http://localhost');
    const slug = url.pathname.slice(1); // Remove leading slash

    if (!slug) {
      console.log('No slug provided, closing connection');
      ws.close(1008, 'Note slug required');
      return;
    }

    console.log(`WebSocket connected for document: ${slug}`);

    // Get or create Yjs document
    let doc = docs.get(slug);
    if (!doc) {
      console.log(`Creating new document for: ${slug}`);
      doc = new Y.Doc();
      docs.set(slug, doc);

      // Get or create note in database
      let note = await getNoteBySlug(slug);
      if (!note) {
        console.log(`Creating new note in database: ${slug}`);
        note = await createNote(slug);
        // Create initial y_doc entry
        await db.insert(yDocs)
          .values({
            docName: slug,
            state: JSON.stringify(Array.from(Y.encodeStateAsUpdate(doc)))
          });
      }

      // Load state from database
      const [result] = await db
        .select()
        .from(yDocs)
        .where(eq(yDocs.docName, slug))
        .limit(1);

      if (result?.state) {
        console.log(`Loading existing state for: ${slug}`);
        const state = new Uint8Array(JSON.parse(result.state));
        Y.applyUpdate(doc, state);
      }

      // Save document state periodically
      const saveInterval = setInterval(async () => {
        if (!doc) return;
        const state = JSON.stringify(Array.from(Y.encodeStateAsUpdate(doc)));
        await db.transaction(async (tx: any) => {
          await tx
            .update(yDocs)
            .set({ state, updatedAt: new Date() })
            .where(eq(yDocs.docName, slug));
        });
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
        if (!doc) return;
        Y.applyUpdate(doc, update);
        
        // Broadcast to all clients except sender
        wss.clients.forEach((client: WebSocket) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(Buffer.from(update)); // Convert Uint8Array to Buffer
          }
        });
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });

    // Send initial document state
    if (doc) {
      const initialState = Y.encodeStateAsUpdate(doc);
      ws.send(Buffer.from(initialState)); // Convert Uint8Array to Buffer
    }
  });

  return wss;
}
