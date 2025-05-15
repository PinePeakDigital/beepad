import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import { logger } from "./test-db-logger";
import { PGlite } from "@electric-sql/pglite";
import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";
import * as schema from "../schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export function createTestDb(): {
  db: PgliteDatabase<typeof schema>;
  client: PGlite;
} {
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

  const db = drizzle(client, { schema, logger });

  return { db, client };
}
