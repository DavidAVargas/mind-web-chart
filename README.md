# Thoughtspun

Spin what's on your mind into something you can see.

Thoughtspun is a visual thinking tool. Each chart starts from one center bubble and branches out into **Areas, Goals, Blockers, Root causes, Actions and Thoughts**. **Threads** tie related bubbles together across branches, with a note on why they connect.

## Features

- Multiple charts, each with its own emoji, from a blank start or a template (Life map, Problem solver)
- Bubble types with their own colors and icons; bubbles shrink the further they are from the center
- Threads: one connector linking several bubbles, with a "why" note
- Notes on every bubble, and a done ✓ on Actions
- Drag a bubble onto another to move its branch, collapse branches, search, tidy up
- Undo/redo, export/import backups, mini-map, light and dark mode
- Everything is saved in your browser

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3001
pnpm lint
pnpm build
```

Built with Next.js, React Flow (`@xyflow/react`) and Tailwind CSS.
