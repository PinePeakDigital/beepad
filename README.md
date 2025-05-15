# BeePad 🐝

BeePad is a real-time multiplayer plain text note-taking application that enables seamless collaboration while being resilient to network issues.

## Features

- **📝 Plain Text First**: Focus on your content with a clean, distraction-free plain text editor
- **🔄 Connection Resilience**: Keep working during connection issues - changes sync automatically when reconnected
- **👥 Real-Time Collaboration**: Work together with others in real-time, with changes syncing seamlessly
- **🎨 User Highlights**: See who made which changes with customizable user colors that fade over time
- **🔗 Simple URLs**: Access notes with human-readable URLs - just add your preferred name to the URL
- **🔌 REST API**: Full CRUD operations available through a RESTful API
- **📦 Embeddable**: Embed any note in your website or application using a simple iframe
- **📚 Version History**: Every change is automatically versioned with full restore capability
- **📱 Cross-Platform**: Available for Windows, macOS, and Linux

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Build for production
pnpm build
```

## How It Works

BeePad uses Conflict-free Replicated Data Types (CRDTs) to enable real-time collaboration while maintaining data consistency during network interruptions. Changes are synced with the server when connected, and the editor remains fully functional even during connection drops.

### Creating & Accessing Notes

Creating a new note is as simple as visiting a URL with your chosen name:

```
https://beepad.app/my-awesome-note
```

If the note doesn't exist yet, it will be created instantly. If it does exist, you'll join the existing note.

### REST API

The BeePad API provides programmatic access to notes:

```bash
# Create a note
POST /api/notes
{
  "slug": "my-note",
  "content": "Hello, world!"
}

# Get a note
GET /api/notes/my-note

# Update a note
PUT /api/notes/my-note
{
  "content": "Updated content"
}

# Delete a note
DELETE /api/notes/my-note

# List versions of a note
GET /api/notes/my-note/versions

# Get specific version
GET /api/notes/my-note/versions/123
```

All API endpoints return JSON responses. Authentication is required via Bearer token.

### Collaborative Features

#### User Highlights
- Each user's edits are highlighted in their chosen color
- Highlights gradually fade over days, showing the age of changes
- Customize your highlight color in the settings
- Colors are remembered per device using cookies

### Version History

Every change to a note is automatically versioned. Access previous versions by adding `/versions` to any note URL:

```
https://beepad.app/my-awesome-note/versions
```

You can:
- Browse through all previous versions
- See what changed between versions
- Restore the note to any previous version
- Copy content from old versions

### Embedding Notes

Embed any note in your website or application using an iframe:

```html
<iframe 
  src="https://beepad.app/my-awesome-note"
  width="100%"
  height="400"
  frameborder="0"
></iframe>
```

## Tech Stack

- Node.js 22.9.0
- PNPM 10.6.1
- [Additional dependencies to be added as project develops]

## Roadmap

- [ ] Basic text editor implementation
- [ ] Connection resilience
- [ ] CRDT implementation
- [ ] Server sync implementation
- [ ] REST API implementation
- [ ] Real-time collaboration
- [ ] User highlight colors
- [ ] Time-based highlight fading
- [ ] Slug-based URLs
- [ ] Instant note creation
- [ ] Version history
- [ ] Version restoration
- [ ] Iframe embedding support
- [ ] Network resilience

## Support

For support, please [open an issue](https://github.com/pinepeakdigital/beepad/issues) on our GitHub repository.
