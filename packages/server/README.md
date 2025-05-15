# @beepad/server

Backend server for BeePad built with Hono and y-websocket.

## Features

- REST API for note management
- WebSocket server for real-time collaboration
- MongoDB integration for persistence
- Authentication and authorization
- Rate limiting and security measures

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

## Structure

- `/src/api` - REST API routes
- `/src/websocket` - WebSocket and Yjs integration
- `/src/db` - Database models and queries
- `/src/middleware` - HTTP middleware
- `/src/utils` - Utility functions

## Environment Variables

- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
