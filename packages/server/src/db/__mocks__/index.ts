import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "../schema";
import { DefaultLogger, LogWriter } from "drizzle-orm/logger";
import fs from "fs";
import path from "path";

const client = new PGlite();

client.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS versions (
    id SERIAL PRIMARY KEY,
    note_id INTEGER REFERENCES notes(id),
    snapshot TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    highlight_color TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS y_docs (
    doc_name TEXT PRIMARY KEY,
    state TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

class MyLogWriter implements LogWriter {
  write(message: string) {
    fs.appendFileSync(
      path.join(__dirname, "../../../logs/test-db.log"),
      `${message.slice(0, 1000)}\n`,
    );
  }
}

const logger = new DefaultLogger({ writer: new MyLogWriter() });

class PglitePool {
  private client: PGlite;

  constructor() {
    this.client = new PGlite();
    this.setupSchema();
  }

  private setupSchema() {
    this.client.exec(`
      CREATE TABLE IF NOT EXISTS notes (...);
      -- Other tables...
    `);
  }

  async connect() {
    // Return an object that mimics a pg pool client
    return {
      query: async (text: string, params?: any[]) => {
        return this.client.query(text, params);
      },
      release: () => {
        // No-op in our case, but needed for API compatibility
      },
    };
  }

  async query(text: string, params?: any[]) {
    return this.client.query(text, params);
  }

  on(event: string, handler: (...args: any[]) => void) {
    // Mock event handlers
    return this;
  }

  end() {
    // Cleanup if needed
  }
}

// Create the pool instance and the drizzle db
const pool = new PglitePool();

export const db: PgliteDatabase<typeof schema> = drizzle(client, {
  schema,
  logger,
});

export default pool;
