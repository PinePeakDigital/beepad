import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { db as defaultDb } from '../db';
import { yDocs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createNote, getNoteBySlug } from '../db/models/note';
import { IncomingMessage } from 'http';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

type Database = PostgresJsDatabase | BetterSQLite3Database;

function serializeState(doc: Y.Doc): string {
  const update = Y.encodeStateAsUpdate(doc);
  const array = Array.from(update);
  return JSON.stringify(array);
}

function deserializeState(state: string): Uint8Array {
  const array = JSON.parse(state);
  if (!Array.isArray(array)) {
    throw new Error('Invalid state format: expected array');
  }
  return new Uint8Array(array);
}

async function saveState(db: Database, slug: string, state: string) {
  // Check if y_doc exists
  const [existing] = await db
    .select()
    .from(yDocs)
    .where(eq(yDocs.docName, slug))
    .limit(1);

  if (existing) {
    // Update existing y_doc
    await db
      .update(yDocs)
      .set({ state, updatedAt: new Date() })
      .where(eq(yDocs.docName, slug));
  } else {
    // Create new y_doc
    await db
      .insert(yDocs)
      .values({
        docName: slug,
        state,
        createdAt: new Date(),
        updatedAt: new Date()
      });
  }
}

export function setupWebSocket(server: any, db: Database = defaultDb, saveInterval = 5000) {
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

      try {
        // Get or create note in database
        let note = await getNoteBySlug(slug);
        if (!note) {
          console.log(`Creating new note in database: ${slug}`);
          note = await createNote(slug);
        }

        // Load state from database
        const [result] = await db
          .select()
          .from(yDocs)
          .where(eq(yDocs.docName, slug))
          .limit(1);

        if (result?.state) {
          try {
            console.log(`Loading existing state for: ${slug}`);
            const state = deserializeState(result.state);
            Y.applyUpdate(doc, state);
          } catch (err) {
            console.error('Error loading state:', err);
            // Create fresh state if loading fails
            await saveState(db, slug, serializeState(doc));
          }
        } else {
          // Save initial state
          await saveState(db, slug, serializeState(doc));
        }

        // Save document state periodically
        const interval = setInterval(async () => {
          if (!doc) return;
          try {
            await saveState(db, slug, serializeState(doc));
          } catch (err) {
            console.error('Error saving state:', err);
          }
        }, saveInterval);

        // Clean up on all clients disconnected
        const cleanup = () => {
          if (wss.clients.size === 0) {
            clearInterval(interval);
            docs.delete(slug);
          }
        };

        ws.on('close', cleanup);
      } catch (err) {
        console.error('Error initializing document:', err);
        ws.close(1011, 'Failed to initialize document');
        return;
      }
    }

    // Handle WebSocket messages
    ws.on('message', async (message: Buffer) => {
      try {
        const update = new Uint8Array(message);
        if (!doc) return;
        Y.applyUpdate(doc, update);
        
        // Save state immediately after update
        await saveState(db, slug, serializeState(doc));
        
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
