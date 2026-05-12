# OS1 Windows Parity Design

## Goal

Build `hermes-os1-windows` as a Windows desktop port of Hermes Desktop - OS1 Edition. The app should preserve the OS1 product shape, visual language, and workflows while replacing macOS-only implementation details with Windows-compatible equivalents.

The target is not a loose redesign. The target is functional and visual parity with the macOS OS1 app wherever the platform allows it.

## Source Product

The reference product is `nickvasilescu/hermes-desktop-os1`, a SwiftUI macOS app for Hermes Agent on Orgo cloud computers and SSH hosts.

Reference surfaces:

- `Sources/OS1/Theme/OS1Theme.swift`
- `Sources/OS1/Theme/OS1Tokens.swift`
- `Sources/OS1/Views/RootView.swift`
- `Sources/OS1/Views/*`
- `Sources/OS1/Services/Orgo/*`
- `Sources/OS1/Services/Terminal/*`
- `Sources/OS1/Resources/Boot/*`
- `assets/*.png`

## Parity Contract

The Windows app must preserve these OS1 traits:

- Coral/cream visual system, DM Sans typography, warm brown text, glass surfaces, and calm motion.
- Left coral sidebar with OS1 brand lockup, active connection card, section navigation, and voice row.
- Boot experience inspired by the macOS OS1 boot resources.
- Same primary app sections: Connections, Overview, Sessions, Cron Jobs, Kanban, Files, Usage, Skills, Knowledge Base, Connectors, Providers, Mail, Messaging, Terminal, Doctor, Desktop, Voice.
- Same Orgo VM workflow: save API key, verify it, choose workspace, choose or create computer, save connection, install Hermes Agent if missing.
- Same host-first mental model: the VM or SSH host remains the source of truth for sessions, files, skills, cron, kanban, and terminal work.
- Same safety stance: credentials stay local, sensitive tokens are not sent to renderer code except through narrow IPC operations that need them.

Platform substitutions are allowed only where required:

- macOS Keychain becomes Windows Credential Manager or encrypted app storage.
- SwiftUI becomes React UI.
- SwiftTerm becomes `xterm.js`.
- macOS `.app` packaging becomes a Windows `.exe` installer.
- AppKit/WebKit behavior becomes Electron BrowserWindow/WebContents behavior.
- macOS app support paths become Windows AppData paths.

## Recommended Architecture

Use Electron, React, TypeScript, and Vite.

### Electron Main Process

Owns native and privileged work:

- Create and manage the main BrowserWindow.
- Store and retrieve credentials.
- Execute local child processes when needed.
- Own all network operations that require secrets.
- Own WebSocket terminal bridges where credentials are needed.
- Expose narrow IPC handlers through preload.
- Package and update behavior.

### Preload API

Expose a typed `window.os1` API to the renderer. The renderer should not get unrestricted Node access.

Initial API groups:

- `connections`: list, save, delete, set active.
- `orgo`: verify API key, list workspaces, list computers, create computer, inspect computer.
- `terminal`: create session, write input, resize, close, subscribe to output.
- `installer`: check Hermes Agent status, install Hermes Agent.
- `providers`: save provider credential, test provider credential.
- `app`: platform info, app version, diagnostics export.

### React Renderer

Owns UI and interaction:

- App shell and routing.
- OS1 design system components.
- Section views.
- Form state and validation.
- Terminal rendering through `xterm.js`.
- Desktop/VNC rendering in a sandboxed webview-like surface.
- Voice status controls.

### Service Layer

Keep domain logic outside components:

- `orgoClient`: Orgo HTTP API, proxy/direct fallback rules.
- `terminalClient`: terminal session lifecycle.
- `hermesInstaller`: installer status and install orchestration.
- `connectionStore`: profiles and active connection metadata.
- `credentialStore`: secure token persistence.
- `sessionsClient`, `kanbanClient`, `filesClient`, `skillsClient`, `cronClient`, `usageClient`: Hermes workspace data.

## UX And Visual Design

The Windows app should feel like the macOS OS1 app, not like a generic Electron dashboard.

Design tokens:

- `bgCream`: `#D9C9AD`
- `bgBeige`: `#CFC0A6`
- `coral`: `#C65A43`
- `coral500`: `#C1553D`
- `coral400`: `#D87660`
- `coral300`: `#E6AD86`
- `coral600`: `#A84832`
- `warning`: `#E2A042`
- `success`: `#7BA88E`

Typography:

- Bundle DM Sans Regular, Light, ExtraLight, Medium.
- Use thin/light type for OS1 surfaces.
- Keep labels uppercase with slight tracking.
- Use monospaced text only for terminal/status/path content.

Layout:

- Full-height desktop app.
- Left sidebar: 196-264 px.
- Split workbench views with stable primary column widths around 360-460 px.
- Coral primary shell with cream/beige detail surfaces.
- No marketing landing page inside the app.

Motion:

- Fast hover feedback around 300 ms.
- Medium view transitions around 600 ms.
- Slow boot/ambient motion around 1200 ms.
- Respect reduced-motion preferences.

## Functional Scope

### Milestone 1: OS1 Shell

Build a Windows app that launches into:

- OS1 boot screen.
- Main shell with sidebar.
- All section routes present.
- Empty/loading states that match OS1 tone.
- Design token system and reusable UI components.

### Milestone 2: Connections And Orgo

Implement:

- Orgo API key save/verify.
- Workspace list.
- Computer list.
- Create computer flow.
- Active connection selection.
- Secure credential storage.

### Milestone 3: Installer And Terminal

Implement:

- Hermes Agent status detection on active Orgo computer.
- One-click Hermes Agent install.
- Real interactive terminal over the Orgo per-VM WebSocket.
- Terminal resize, copy, paste, and reconnect states.

### Milestone 4: Workspace Sections

Implement OS1 parity sections:

- Overview
- Sessions
- Cron Jobs
- Kanban
- Files
- Usage
- Skills
- Knowledge Base

Each section should use the same remote state model as OS1. Do not introduce a second local source of truth.

### Milestone 5: Extended Sections

Implement:

- Providers
- Connectors
- Mail
- Messaging
- Doctor
- Desktop/VNC
- Realtime Voice

Voice and Desktop may require extra platform testing on Windows because they rely on browser/media APIs and VM screen streaming.

## Data Flow

Orgo cloud connection:

1. Renderer asks main process to verify/save API key.
2. Main stores API key securely.
3. Renderer requests workspaces/computers through typed IPC.
4. Main calls Orgo API and returns sanitized data.
5. Renderer saves selected connection metadata without embedding the secret.
6. Terminal and installer operations ask main to use the active credential.
7. Main opens HTTP/WebSocket calls to the VM and streams status/output back.

SSH connection:

1. Renderer collects alias, host, user, port, and Hermes profile.
2. Main validates that non-interactive SSH can reach the host.
3. Main uses Windows-compatible SSH execution and terminal bridging.
4. Renderer displays the same workspace sections using SSH-backed service calls.

## Security Model

- Keep `nodeIntegration` disabled.
- Keep `contextIsolation` enabled.
- Renderer never reads raw Orgo, OpenAI, or provider keys directly.
- Use narrow IPC names and typed payloads.
- Validate all renderer inputs in main process handlers.
- Do not log credentials.
- Redact secrets in diagnostics.
- Prefer OS credential storage. If unavailable, use encrypted storage with a Windows user-bound secret.

## Packaging And GitHub

The repository should include:

- `package.json` scripts for dev, test, lint, typecheck, build, and Windows package.
- Electron builder or Forge packaging for NSIS `.exe`.
- GitHub Actions workflow for Windows builds.
- Release artifact upload for `.exe` and checksum.
- README with Windows install/use instructions.

First release target:

- Unsigned `.exe` installer.
- Clear SmartScreen warning note.
- Checksums attached to GitHub Release.

Later release target:

- Code signing certificate support.
- Auto-update channel if desired.

## Testing

Automated checks:

- TypeScript typecheck.
- Unit tests for service clients and IPC payload validation.
- Renderer component tests for critical forms.
- Playwright or equivalent smoke test for shell navigation.
- Package smoke test in GitHub Actions.

Manual parity checks:

- Compare sidebar, boot screen, and core sections against macOS OS1 screenshots.
- Verify Orgo API key save/verify.
- Verify workspace and computer selection.
- Verify VM creation.
- Verify Hermes Agent install.
- Verify terminal output, input, resize, reconnect.
- Verify Windows app install/uninstall.

## Non-Goals For First Implementation Pass

- No attempt to compile SwiftUI on Windows.
- No hidden second backend or local database that replaces the host.
- No complete local Hermes installer unless needed for a later local-mode product.
- No broad redesign away from OS1.
- No platform-specific hacks that make future macOS/Linux ports impossible.

## Success Criteria

The first usable release is successful when a Windows user can:

1. Install the `.exe`.
2. Launch into an OS1-styled boot and shell.
3. Save an Orgo API key.
4. Select or create a cloud computer.
5. Install Hermes Agent if missing.
6. Open a live terminal to the VM.
7. Navigate the OS1 sections without visual breakage.

Full parity is successful when all primary macOS OS1 sections work against the same Orgo/Hermes data flows with Windows-native packaging and secure credential handling.
