import { drizzle, sql } from "drizzle-orm/pglite";
import { logger } from "./test-db-logger";
import { PGlite } from "@electric-sql/pglite";
import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const versions = pgTable("versions", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").references(() => notes.id),
  snapshot: text("snapshot").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey(),
  highlightColor: text("highlight_color").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const yDocs = pgTable("y_docs", {
  docName: text("doc_name").primaryKey(),
  state: text("state"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export function createTestDb() {
  // Create an in-memory SQLite database
  const client = new PGlite();

  // Create tables
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

  // Create drizzle instance
  const db = drizzle(client, { logger });

  return { db, client };
}
