# Local Gemma Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the active Orgo connection flow with a free Local Gemma/Ollama provider.

**Architecture:** Keep local machine integration in Electron main. Expose a narrow typed IPC surface for Ollama status, Gemma model pull, and local connection save. Keep renderer focused on OS1 UI and sanitized provider state.

**Tech Stack:** Electron, Node child_process, Node fetch, React 19, TypeScript, Vitest, Testing Library, Ollama local API.

---

## File Structure

- Modify `src/shared/ipc.ts` and `src/shared/ipc.test.ts` for local provider contracts.
- Create `src/main/ollamaClient.ts` and `src/main/ollamaClient.test.ts` for local Ollama API integration.
- Modify `src/main/appPaths.ts` and `src/main/ipc.ts` to remove Orgo handlers and add local provider handlers.
- Modify `src/preload/index.ts` to expose `localAi`.
- Modify `src/renderer/views/ConnectionsView.tsx` and tests to show Local Gemma setup.
- Modify `src/renderer/App.test.tsx`, `src/renderer/components/Sidebar.tsx`, and CSS.
- Delete Orgo-only main modules and tests.
- Update `README.md`.

### Task 1: Shared Contracts

- [ ] Add failing tests for `assertPullLocalModelRequest` and `assertLocalConnectionDraft`.
- [ ] Replace Orgo shared types/channels with `LocalAiStatus`, `LocalAiModelSummary`, `GemmaModelId`, `LocalConnectionDraft`, and `PullLocalModelRequest`.
- [ ] Extend `OS1Api` with `localAi.status()` and `localAi.pullModel()`.
- [ ] Extend `connections` with `saveLocal()`.
- [ ] Run `npm run test -- src/shared/ipc.test.ts`.
- [ ] Commit.

### Task 2: Ollama Client

- [ ] Add failing tests for local model status, stopped Ollama status, model pull body, and missing server errors.
- [ ] Implement `src/main/ollamaClient.ts` using injectable `fetchImpl` and `runCommand`.
- [ ] Use `GET /api/tags` for installed models and `POST /api/pull` with `{ model, stream: false }`.
- [ ] Run `npm run test -- src/main/ollamaClient.test.ts`.
- [ ] Commit.

### Task 3: Main And Preload IPC

- [ ] Remove Orgo credential path from `appPaths`.
- [ ] Remove Orgo handlers from `ipc.ts`.
- [ ] Register `localAiStatus`, `localAiPullModel`, and `connectionsSaveLocal`.
- [ ] Expose `localAi` and `saveLocal` in preload.
- [ ] Run `npm run typecheck`.
- [ ] Commit.

### Task 4: Connections UI

- [ ] Replace Orgo UI tests with Local Gemma tests.
- [ ] Replace Orgo API key UI with Ollama status, Gemma model cards, Pull Gemma 4, runtime selector, workspace path, and Save Local Workspace.
- [ ] Update `App.test.tsx` mock and sidebar copy.
- [ ] Update CSS class names from Orgo to local provider names.
- [ ] Run `npm run test -- src/renderer/views/ConnectionsView.test.tsx src/renderer/App.test.tsx`.
- [ ] Commit.

### Task 5: Cleanup, Docs, Verification

- [ ] Delete Orgo-only client and credential store modules/tests.
- [ ] Update README to say Local Gemma/Ollama is current and Orgo is removed from active provider flow.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run build:win`.
- [ ] Merge to `main`, push, and confirm clean status.

## Self-Review

Spec coverage: The plan replaces Orgo as active backend, adds Local Gemma/Ollama IPC, updates UI, deletes Orgo-only code, and verifies installer output.

Placeholder scan: No TBD, TODO, or incomplete file paths.

Type consistency: Local provider names are `localAi` for IPC, `LocalConnectionDraft` for saved connections, and `GemmaModelId` for allowed model IDs.
