import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
import { db as defaultDb } from "../db";
import { yDocs } from "../db/schema";
import { eq } from "drizzle-orm";
import { createNote, getNoteBySlug } from "../db/models/note";
import { IncomingMessage } from "http";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { PgDatabase } from "drizzle-orm/pg-core";
import { PgQueryResultHKT } from "drizzle-orm/pg-core";

type Database =
  | PostgresJsDatabase
  | PgDatabase<PgQueryResultHKT, Record<string, unknown>>;

function serializeState(doc: Y.Doc): string {
  const update = Y.encodeStateAsUpdate(doc);
  const array = Array.from(update);
  return JSON.stringify(array);
}

function deserializeState(state: string): Uint8Array {
  const array = JSON.parse(state);
  if (!Array.isArray(array)) {
    throw new Error("Invalid state format: expected array");
  }
  return new Uint8Array(array);
}

async function saveState(db: Database, slug: string, doc: Y.Doc) {
  const state = serializeState(doc);
  const [existing] = await db
    .select()
    .from(yDocs)
    .where(eq(yDocs.docName, slug))
    .limit(1);

  if (existing) {
    await db
      .update(yDocs)
      .set({ state, updatedAt: new Date() })
      .where(eq(yDocs.docName, slug));
  } else {
    await db.insert(yDocs).values({
      docName: slug,
      state,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export function setupWebSocket(
  server: any,
  db: Database = defaultDb,
  saveInterval = 5000,
) {
  const wss = new WebSocketServer({ server });
  const docs = new Map<string, Y.Doc>();
  const intervals = new Map<string, NodeJS.Timeout>();
  const pendingSaves = new Map<string, Promise<void>>();

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    console.log("WebSocket connection established");
    const url = new URL(req.url || "", "http://localhost");
    const slug = url.pathname.slice(1); // Remove leading slash

    if (!slug) {
      console.log("No slug provided, closing connection");
      ws.close(1008, "Note slug required");
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
            console.error("Error loading state:", err);
            // Create fresh state if loading fails
            await saveState(db, slug, doc);
          }
        } else {
          // Save initial state
          await saveState(db, slug, doc);
        }

        // Save document state periodically
        const interval = setInterval(async () => {
          if (!doc) return;
          try {
            const savePromise = saveState(db, slug, doc);
            pendingSaves.set(slug, savePromise);
            await savePromise;
            pendingSaves.delete(slug);
          } catch (err) {
            console.error("Error saving state:", err);
          }
        }, saveInterval);
        intervals.set(slug, interval);
      } catch (err) {
        console.error("Error initializing document:", err);
        ws.close(1011, "Failed to initialize document");
        return;
      }
    }

    // Handle WebSocket messages
    ws.on("message", async (message: Buffer) => {
      try {
        const update = new Uint8Array(message);
        if (!doc) return;

        // Apply update to document
        Y.applyUpdate(doc, update);

        // Save state immediately after update
        const savePromise = saveState(db, slug, doc);
        pendingSaves.set(slug, savePromise);
        await savePromise;
        pendingSaves.delete(slug);

        // Broadcast to all clients except sender
        const broadcastPromises: Promise<void>[] = [];
        wss.clients.forEach((client: WebSocket) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            broadcastPromises.push(
              new Promise<void>((resolve, reject) => {
                client.send(Buffer.from(update), (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              }),
            );
          }
        });
        await Promise.all(broadcastPromises);
      } catch (err) {
        console.error("Error processing message:", err);
      }
    });

    // Send initial document state
    if (doc) {
      const initialState = Y.encodeStateAsUpdate(doc);
      await new Promise<void>((resolve, reject) => {
        ws.send(Buffer.from(initialState), (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Clean up on client disconnect
    ws.on("close", async () => {
      // Wait for any pending saves to complete
      const pendingSave = pendingSaves.get(slug);
      if (pendingSave) {
        try {
          await pendingSave;
        } catch (err) {
          console.error("Error waiting for pending save:", err);
        }
      }

      // Save final state before cleanup
      if (doc) {
        try {
          // Save state one last time and wait for it to complete
          await saveState(db, slug, doc);

          // Double check the state was saved correctly
          const [result] = await db
            .select()
            .from(yDocs)
            .where(eq(yDocs.docName, slug))
            .limit(1);

          if (!result?.state) {
            console.error("Failed to save final state");
            return;
          }

          // Only clean up if this was the last client
          if (wss.clients.size === 0) {
            const interval = intervals.get(slug);
            if (interval) {
              clearInterval(interval);
              intervals.delete(slug);
            }
            docs.delete(slug);
          }
        } catch (err) {
          console.error("Error saving final state:", err);
        }
      }
    });
  });

  return wss;
}
