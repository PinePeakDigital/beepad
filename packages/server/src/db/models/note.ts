import { eq } from 'drizzle-orm';
import { db } from '../index';
import { notes, yDocs } from '../schema';
import type { Note } from '@beepad/shared';

export async function createNote(slug: string): Promise<Note> {
  const [note] = await db.insert(notes)
    .values({ slug })
    .returning();

  await db.insert(yDocs)
    .values({ docName: slug })
    .returning();

  return note;
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const [note] = await db
    .select()
    .from(notes)
    .leftJoin(yDocs, eq(notes.slug, yDocs.docName))
    .where(eq(notes.slug, slug))
    .limit(1);

  return note?.notes || null;
}

export async function updateNote(slug: string, content: string): Promise<Note> {
  const [note] = await db
    .update(notes)
    .set({ updatedAt: new Date() })
    .where(eq(notes.slug, slug))
    .returning();

  return note;
}

export async function deleteNote(slug: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(yDocs).where(eq(yDocs.docName, slug));
    await tx.delete(notes).where(eq(notes.slug, slug));
  });
}
