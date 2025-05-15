# BeePad Project Knowledge

## Project Overview
BeePad is a real-time collaborative text editor built with:
- Next.js (frontend)
- Hono (backend API)
- PostgreSQL (database)
- Yjs (real-time collaboration)
- TipTap (rich text editor)

## Development Setup
- Uses pnpm workspaces for monorepo management
- Requires PostgreSQL running (via Docker)
- Requires both frontend and backend servers running

## Key Commands
- `pnpm typecheck` - Run type checking
- `docker compose up -d` - Start PostgreSQL
- `pnpm --filter @beepad/server migrate` - Run database migrations

## Architecture Notes
- Frontend and backend communicate via WebSocket for real-time updates
- Document state is persisted in both `notes` and `y_docs` tables
- Each note has a unique slug used as identifier across the system