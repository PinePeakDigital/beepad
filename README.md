# BeePad 🐝

BeePad is a local-first, real-time multiplayer plain text note-taking application that puts your privacy and data ownership first while enabling seamless collaboration.

## Features

- **📝 Plain Text First**: Focus on your content with a clean, distraction-free plain text editor
- **🔒 Local-First Architecture**: Your notes are stored locally first, ensuring you always have access to your data
- **👥 Real-Time Collaboration**: Work together with others in real-time, with changes syncing seamlessly
- **🔄 Offline Support**: Keep working even without an internet connection - changes sync when you're back online
- **🔗 Simple URLs**: Access notes with human-readable URLs - just add your preferred name to the URL
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

BeePad uses Conflict-free Replicated Data Types (CRDTs) to enable real-time collaboration while maintaining local-first principles. All data is stored locally first and synced with a secure server instance. The server acts as a relay point for real-time collaboration and provides persistent storage.

### Creating & Accessing Notes

Creating a new note is as simple as visiting a URL with your chosen name:

```
https://beepad.app/my-awesome-note
```

If the note doesn't exist yet, it will be created instantly. If it does exist, you'll join the existing note.

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
- [ ] Local storage integration
- [ ] CRDT implementation
- [ ] Server sync implementation
- [ ] Real-time collaboration
- [ ] Slug-based URLs
- [ ] Instant note creation
- [ ] Version history
- [ ] Version restoration
- [ ] Iframe embedding support
- [ ] Offline support

## Support

For support, please [open an issue](https://github.com/pinepeakdigital/beepad/issues) on our GitHub repository.
