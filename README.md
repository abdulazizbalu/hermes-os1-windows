# Hermes OS1 Windows

Windows desktop port of Hermes Desktop - OS1 Edition.

This project preserves the OS1 product shape, visual design, and host-first workflows while replacing macOS-only implementation details with Windows-compatible equivalents.

## Current Status

The first slice provides:

- Electron + React + TypeScript desktop shell
- OS1 coral/cream design tokens
- OS1 boot screen
- Sidebar and all OS1 section routes
- Typed secure IPC skeleton
- Orgo API key verification and secure credential storage
- Workspace and computer picker
- Orgo computer creation
- Windows installer workflow

Upcoming slices add:

- Hermes Agent install on Orgo VM
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

The installer is written to `release/`.

## Windows SmartScreen

Early builds are unsigned. Windows SmartScreen may show a warning on first launch. Use only installers from this repository's GitHub Releases.

## Design Reference

Reference product: `nickvasilescu/hermes-desktop-os1`.

Parity spec: `docs/superpowers/specs/2026-05-12-os1-windows-parity-design.md`.
