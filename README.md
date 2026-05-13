# Luma Desktop

Local AI workspace for Windows powered by Gemma.

Luma Desktop keeps a calm desktop workspace shape, but is branded and tuned for a Windows-first local AI experience.

## Current Status

The first slice provides:

- Electron + React + TypeScript desktop shell
- Luma glass/coral design tokens
- Luma boot screen, sidebar, and section routes
- Typed secure IPC skeleton
- Local Gemma/Ollama provider with no API key requirement
- Gemma 4 E4B first-run flow with automatic Ollama preparation and Russian response check
- Russian UI for the boot, sidebar, sections, and Local Gemma setup
- Local Windows/WSL workspace connection flow
- Windows installer workflow

Upcoming slices add:

- Luma Agent install for Local Windows/WSL
- WebSocket terminal
- Overview, Sessions, Kanban, Files, Skills, Cron, Usage
- Providers, Voice, Desktop/VNC, Mail, Messaging, Doctor

## Development

```sh
npm install
npm run dev
```

## Checks

```sh
npm run typecheck
npm run test
npm run build
```

## Build Windows Installer

```sh
npm run build:win
```

The installer is written to `release/` as `Luma-Desktop-...exe`.

## Windows SmartScreen

Early builds are unsigned. Windows SmartScreen may show a warning on first launch. Use only installers from this repository's GitHub Releases.

## Design Reference

Reference product: `nickvasilescu/hermes-desktop-os1`.

Parity spec: `docs/superpowers/specs/2026-05-12-os1-windows-parity-design.md`.
