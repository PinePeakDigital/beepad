import { query } from '../index';

export async function up() {
  // Notes table
  await query(`
    CREATE TABLE notes (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Versions table
  await query(`
    CREATE TABLE versions (
      id SERIAL PRIMARY KEY,
      note_id INTEGER REFERENCES notes(id),
      snapshot TEXT NOT NULL,
      author TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // User preferences
  await query(`
    CREATE TABLE user_preferences (
      user_id TEXT PRIMARY KEY,
      highlight_color TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Yjs document storage
  await query(`
    CREATE TABLE y_docs (
      doc_name TEXT PRIMARY KEY,
      state TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
