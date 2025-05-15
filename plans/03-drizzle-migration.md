# Migrate to Drizzle ORM

## 1. Install Dependencies
```bash
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit
```

## 2. Schema Definition
Convert existing PostgreSQL schema to Drizzle schema:
```typescript
// schema.ts
import { pgTable, serial, text, timestamp, bytea } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const versions = pgTable('versions', {
  id: serial('id').primaryKey(),
  noteId: integer('note_id').references(() => notes.id),
  snapshot: bytea('snapshot').notNull(),
  author: text('author').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const userPreferences = pgTable('user_preferences', {
  userId: text('user_id').primaryKey(),
  highlightColor: text('highlight_color').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const yDocs = pgTable('y_docs', {
  docName: text('doc_name').primaryKey(),
  state: bytea('state'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
```

## 3. Database Client Setup
Replace pg Pool with Drizzle client setup.

## 4. Migration System
- Set up drizzle-kit for migrations
- Convert existing migrations to Drizzle format
- Add migration scripts to package.json

## 5. Update Models
Refactor model functions to use Drizzle query builder instead of raw SQL.

## 6. Update WebSocket Handler
Update WebSocket handler to use new Drizzle models.

## Success Criteria
- [ ] All tables defined in Drizzle schema
- [ ] Migrations working with drizzle-kit
- [ ] All CRUD operations working through Drizzle
- [ ] WebSocket collaboration still functioning
- [ ] No raw SQL queries remaining
