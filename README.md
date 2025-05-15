# BeePad 🐝

BeePad is a local-first, real-time multiplayer plain text note-taking application that puts your privacy and data ownership first while enabling seamless collaboration.

## Features

- **📝 Plain Text First**: Focus on your content with a clean, distraction-free plain text editor
- **🔒 Local-First Architecture**: Your notes are stored locally first, ensuring you always have access to your data
- **👥 Real-Time Collaboration**: Work together with others in real-time, with changes syncing seamlessly
- **🔄 Offline Support**: Keep working even without an internet connection - changes sync when you're back online
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
- [ ] Offline support

## Support

For support, please [open an issue](https://github.com/pinepeakdigital/beepad/issues) on our GitHub repository.
