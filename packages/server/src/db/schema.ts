import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  json,
} from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const versions = pgTable("versions", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").references(() => notes.id),
  snapshot: text("snapshot").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey(),
  highlightColor: text("highlight_color").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const yDocs = pgTable("y_docs", {
  docName: text("doc_name").primaryKey(),
  state: text("state"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
