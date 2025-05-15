import { query, transaction } from '../index';
import type { Note } from '@beepad/shared';

export async function createNote(slug: string): Promise<Note> {
  return await transaction(async (client) => {
    // Create note
    const noteResult = await client.query(
      'INSERT INTO notes (slug) VALUES ($1) RETURNING *',
      [slug]
    );

    // Create y_doc entry
    await client.query(
      'INSERT INTO y_docs (doc_name) VALUES ($1)',
      [slug]
    );

    return noteResult.rows[0];
  });
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const result = await query(
    'SELECT notes.*, y_docs.state FROM notes LEFT JOIN y_docs ON notes.slug = y_docs.doc_name WHERE notes.slug = $1',
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
    // Delete y_doc first due to foreign key constraint
    await client.query('DELETE FROM y_docs WHERE doc_name = $1', [slug]);
    await client.query('DELETE FROM notes WHERE slug = $1', [slug]);
  });
}
