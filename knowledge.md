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

## Dependency Overrides
The `pnpm.overrides` block in the root `package.json` exists solely to force
patched versions of transitive dependencies that upstream still pins to
vulnerable releases. Each entry can be dropped once every consumer resolves a
patched version on its own:

| Override | Reason | Drop when |
| --- | --- | --- |
| `brace-expansion@1` `^1.1.18` | GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895 (DoS) — reaches the tree via `minimatch@3` under the eslint toolchain | eslint's `minimatch@3` chain resolves >= 1.1.18 |
| `brace-expansion@2` `^2.1.4` | same two advisories, 2.x line | consumers resolve >= 2.1.4 |
| `brace-expansion@5` `^5.0.9` | same two advisories, 4.x/5.x line | consumers resolve >= 5.0.9 |
| `postcss` `^8.5.25` | GHSA-r28c-9q8g-f849, GHSA-6g55-p6wh-862q (sourceMappingURL file disclosure) — `next` pins postcss to exactly `8.4.31` | `next` pins postcss >= 8.5.18 |
| `sharp` `^0.35.3` | GHSA-f88m-g3jw-g9cj (inherited libvips CVEs) — `next` 15.x declares `sharp ^0.34.3`; `next` 16 already uses `^0.35.3` | the project upgrades to `next` >= 16 |

Note the major-scoped selectors (`brace-expansion@1/@2/@5`) only constrain those
majors. If a future dependency pulls in `brace-expansion` 3.x or 4.x, it will be
unconstrained and needs its own entry.

## Architecture Notes
- Frontend and backend communicate via WebSocket for real-time updates
- Document state is persisted in both `notes` and `y_docs` tables
- Each note has a unique slug used as identifier across the system