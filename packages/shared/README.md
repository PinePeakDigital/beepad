# @beepad/shared

Shared types and utilities for BeePad packages.

## Features

- TypeScript interfaces
- Shared constants
- Common utilities
- API type definitions

## Development

```bash
# Watch for changes
pnpm dev

# Build package
pnpm build

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

## Structure

- `/src/types` - Shared TypeScript interfaces
- `/src/utils` - Common utility functions

## Usage

This package is used internally by other BeePad packages. It's included as a workspace dependency:

```json
{
  "dependencies": {
    "@beepad/shared": "workspace:*"
  }
}
```
