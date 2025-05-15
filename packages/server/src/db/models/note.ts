import { query, transaction } from '../index';
import type { Note } from '@beepad/shared';

export async function createNote(slug: string): Promise<Note> {
  const result = await query(
    'INSERT INTO notes (slug) VALUES ($1) RETURNING *',
    [slug]
  );
  return result.rows[0];
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const result = await query(
    'SELECT * FROM notes WHERE slug = $1',
    [slug]
  );
  return result.rows[0] || null;
}

export async function updateNote(slug: string, content: string): Promise<Note> {
  const result = await query(
    'UPDATE notes SET content = $1, updated_at = NOW() WHERE slug = $2 RETURNING *',
    [content, slug]
  );
  return result.rows[0];
}

export async function deleteNote(slug: string): Promise<void> {
  await transaction(async (client) => {
    // Delete versions first due to foreign key constraint
    await client.query('DELETE FROM versions WHERE note_id = (SELECT id FROM notes WHERE slug = $1)', [slug]);
    await client.query('DELETE FROM notes WHERE slug = $1', [slug]);
  });
}
