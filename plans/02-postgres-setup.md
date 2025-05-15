# PostgreSQL Integration Plan

## 1. Update Dependencies
- Remove MongoDB dependencies
- Add PostgreSQL and y-pg dependencies
- Update shared types

## 2. Database Schema
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE versions (
  id SERIAL PRIMARY KEY,
  note_id INTEGER REFERENCES notes(id),
  snapshot BYTEA NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  highlight_color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- For y-pg
CREATE TABLE y_docs (
  doc_id TEXT PRIMARY KEY,
  doc_name TEXT NOT NULL,
  state BYTEA,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3. Server Implementation
- Set up PostgreSQL connection pool
- Configure y-pg provider
- Update API endpoints
- Add database migrations

## 4. Local Development
- Add Docker Compose for PostgreSQL
- Update environment variables
- Add database seeding

## Success Criteria
- [ ] PostgreSQL running in development
- [ ] y-pg provider working with Yjs
- [ ] Migrations working
- [ ] Basic CRUD operations working
- [ ] Version history working
