# Cadence Station — macOS Menu Bar App

Quick-start focus sessions without opening a browser tab.

## Features

- Start 25 / 50 / 90-minute focus sessions from the menu bar
- Session countdown in the menu bar tooltip
- Native macOS notifications when sessions complete
- Opens the full web app when you need more control

## Setup

```bash
cd macos-menubar
npm install
```

## Development

```bash
npm start
```

The app will appear in your menu bar (no dock icon).

## Building

```bash
npm run build
```

Produces a `.app` bundle in `dist/mac/`.

## Requirements

- macOS 12+
- Node.js 18+
- Electron 33+
