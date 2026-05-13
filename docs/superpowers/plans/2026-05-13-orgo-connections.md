# Orgo Connections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the draft Connections screen with a real OS1 Orgo setup flow: secure API key storage, key verification, workspace/computer picker, create-computer action, and saved Orgo connection metadata.

**Architecture:** Keep secrets in Electron main only. Add a testable Orgo HTTP client and encrypted credential store in `src/main`, expose narrow IPC methods through preload, and make the renderer consume sanitized workspace/computer data without raw API keys.

**Tech Stack:** Electron safeStorage, Node fetch, React 19, TypeScript, Vitest, Testing Library.

---

## Scope Check

This plan implements Milestone 2 from the parity spec: Connections and Orgo. It does not implement Hermes Agent installation, WebSocket terminal, or workspace section data loading; those are the next vertical slices.

The API shape mirrors the macOS OS1 source:

- `GET https://www.orgo.ai/api/projects` returns projects with nested `desktops`.
- `POST https://www.orgo.ai/api/computers` creates a computer using defaults: linux, 8 GB RAM, 4 CPU, no GPU, 50 GB disk, `1280x720x24`.

## File Structure

- Modify `src/shared/ipc.ts`: add Orgo types, validation helpers, and IPC methods.
- Create `src/main/orgoClient.ts`: testable Orgo HTTP client.
- Create `src/main/orgoClient.test.ts`: client unit tests with fake fetch.
- Create `src/main/credentialStore.ts`: encrypted file credential store using injectable crypto.
- Create `src/main/credentialStore.test.ts`: credential behavior tests using fake crypto and temp files.
- Modify `src/main/ipc.ts`: register Orgo credential/catalog handlers and save real Orgo connections.
- Modify `src/preload/index.ts`: expose new IPC methods.
- Modify `src/renderer/views/ConnectionsView.tsx`: replace draft form with Orgo setup flow.
- Modify `src/renderer/App.test.tsx`: update window.os1 mock and add connection UI smoke coverage.
- Create `src/renderer/views/ConnectionsView.test.tsx`: renderer tests for key save, workspace selection, create computer, and connection save.
- Modify `README.md`: update current status.

---

### Task 1: Shared Orgo Contracts

**Files:**
- Modify: `src/shared/ipc.ts`
- Test: `src/shared/ipc.test.ts`

- [ ] **Step 1: Write failing tests for Orgo payload validation**

Add to `src/shared/ipc.test.ts`:

```ts
import { assertCreateOrgoComputerRequest, assertOrgoConnectionDraft } from "./ipc.js";

describe("assertOrgoConnectionDraft", () => {
  it("normalizes valid Orgo connection drafts", () => {
    expect(
      assertOrgoConnectionDraft({
        label: " OS1 VM ",
        workspaceId: " workspace-1 ",
        workspaceName: " Main ",
        computerId: " computer-1 ",
        computerName: " Hermes "
      })
    ).toEqual({
      label: "OS1 VM",
      workspaceId: "workspace-1",
      workspaceName: "Main",
      computerId: "computer-1",
      computerName: "Hermes"
    });
  });

  it("rejects missing workspace and computer ids", () => {
    expect(() =>
      assertOrgoConnectionDraft({
        label: "OS1 VM",
        workspaceId: "",
        workspaceName: "Main",
        computerId: "",
        computerName: "Hermes"
      })
    ).toThrow("Orgo workspace is required.");
  });
});

describe("assertCreateOrgoComputerRequest", () => {
  it("normalizes computer creation requests", () => {
    expect(
      assertCreateOrgoComputerRequest({
        workspaceId: " workspace-1 ",
        computerName: " My Computer "
      })
    ).toEqual({
      workspaceId: "workspace-1",
      computerName: "My Computer"
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/shared/ipc.test.ts`

Expected: FAIL because `assertOrgoConnectionDraft` and `assertCreateOrgoComputerRequest` are not exported.

- [ ] **Step 3: Add shared Orgo types and validation**

Add to `src/shared/ipc.ts`:

```ts
export interface OrgoComputerSummary {
  id: string;
  name: string;
  status: string;
}

export interface OrgoWorkspaceSummary {
  id: string;
  name: string;
  computers: OrgoComputerSummary[];
}

export interface OrgoCredentialStatus {
  hasApiKey: boolean;
}

export interface SaveOrgoApiKeyRequest {
  apiKey: string;
}

export interface CreateOrgoComputerRequest {
  workspaceId: string;
  computerName: string;
}

export interface OrgoConnectionDraft {
  label: string;
  workspaceId: string;
  workspaceName: string;
  computerId: string;
  computerName: string;
}
```

Extend `ipcChannels`:

```ts
  orgoCredentialStatus: "orgo:credentialStatus",
  orgoSaveApiKey: "orgo:saveApiKey",
  orgoClearApiKey: "orgo:clearApiKey",
  orgoListWorkspaces: "orgo:listWorkspaces",
  orgoCreateComputer: "orgo:createComputer",
  connectionsSaveOrgo: "connections:saveOrgo"
```

Extend `OS1Api`:

```ts
  orgo: {
    credentialStatus(): Promise<OrgoCredentialStatus>;
    saveApiKey(request: SaveOrgoApiKeyRequest): Promise<OrgoCredentialStatus>;
    clearApiKey(): Promise<OrgoCredentialStatus>;
    listWorkspaces(): Promise<OrgoWorkspaceSummary[]>;
    createComputer(request: CreateOrgoComputerRequest): Promise<OrgoComputerSummary>;
  };
```

Extend `connections`:

```ts
    saveOrgo(draft: OrgoConnectionDraft): Promise<ConnectionSummary>;
```

Extend `ConnectionSummary`:

```ts
  workspaceId?: string;
  workspaceName?: string;
  computerId?: string;
  computerName?: string;
```

Add validators:

```ts
function requiredTrimmedString(value: unknown, message: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(message);
  }
  return text;
}

export function assertCreateOrgoComputerRequest(value: unknown): CreateOrgoComputerRequest {
  if (!value || typeof value !== "object") {
    throw new Error("Create computer request must be an object.");
  }

  const candidate = value as Record<string, unknown>;
  return {
    workspaceId: requiredTrimmedString(candidate.workspaceId, "Orgo workspace is required."),
    computerName: requiredTrimmedString(candidate.computerName, "Computer name is required.")
  };
}

export function assertOrgoConnectionDraft(value: unknown): OrgoConnectionDraft {
  if (!value || typeof value !== "object") {
    throw new Error("Orgo connection draft must be an object.");
  }

  const candidate = value as Record<string, unknown>;
  return {
    label: requiredTrimmedString(candidate.label, "Connection label is required."),
    workspaceId: requiredTrimmedString(candidate.workspaceId, "Orgo workspace is required."),
    workspaceName: requiredTrimmedString(candidate.workspaceName, "Workspace name is required."),
    computerId: requiredTrimmedString(candidate.computerId, "Orgo computer is required."),
    computerName: requiredTrimmedString(candidate.computerName, "Computer name is required.")
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/shared/ipc.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit shared contracts**

```bash
git add src/shared/ipc.ts src/shared/ipc.test.ts
git commit -m "feat: add Orgo IPC contracts"
```

---

### Task 2: Orgo HTTP Client

**Files:**
- Create: `src/main/orgoClient.ts`
- Create: `src/main/orgoClient.test.ts`

- [ ] **Step 1: Write failing Orgo client tests**

Create `src/main/orgoClient.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { OrgoClient } from "./orgoClient.js";

describe("OrgoClient", () => {
  it("lists projects as OS1 workspaces with nested computers", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        projects: [
          {
            id: "workspace-1",
            name: "Main",
            desktops: [{ id: "computer-1", name: "", status: "running" }]
          }
        ]
      })
    });

    const client = new OrgoClient({ apiKeyProvider: () => "sk-orgo", fetchImpl });

    await expect(client.listWorkspaces()).resolves.toEqual([
      {
        id: "workspace-1",
        name: "Main",
        computers: [{ id: "computer-1", name: "Untitled", status: "running" }]
      }
    ]);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://www.orgo.ai/api/projects",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer sk-orgo" }
      })
    );
  });

  it("creates computers with the macOS OS1 defaults", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "computer-2", name: "Hermes", status: "creating" })
    });

    const client = new OrgoClient({ apiKeyProvider: () => "sk-orgo", fetchImpl });

    await expect(client.createComputer({ workspaceId: "workspace-1", computerName: "Hermes" })).resolves.toEqual({
      id: "computer-2",
      name: "Hermes",
      status: "creating"
    });
    expect(JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))).toEqual({
      workspace_id: "workspace-1",
      name: "Hermes",
      os: "linux",
      ram: 8,
      cpu: 4,
      gpu: "none",
      disk_size_gb: 50,
      resolution: "1280x720x24"
    });
  });

  it("rejects missing API keys before making requests", async () => {
    const fetchImpl = vi.fn();
    const client = new OrgoClient({ apiKeyProvider: () => "", fetchImpl });

    await expect(client.listWorkspaces()).rejects.toThrow("No Orgo API key configured.");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/main/orgoClient.test.ts`

Expected: FAIL because `src/main/orgoClient.ts` does not exist.

- [ ] **Step 3: Implement `src/main/orgoClient.ts`**

```ts
import { CreateOrgoComputerRequest, OrgoComputerSummary, OrgoWorkspaceSummary } from "../shared/ipc.js";

interface OrgoClientOptions {
  apiKeyProvider(): string | undefined;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

interface ProjectListResponse {
  projects: Array<{
    id: string;
    name: string;
    desktops?: Array<{
      id: string;
      name?: string | null;
      status?: string | null;
    }>;
  }>;
}

interface CreateComputerResponse {
  id: string;
  name?: string | null;
  status?: string | null;
}

export class OrgoClient {
  private readonly baseUrl: string;
  private readonly apiKeyProvider: () => string | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor({ apiKeyProvider, baseUrl = "https://www.orgo.ai/api", fetchImpl = fetch }: OrgoClientOptions) {
    this.apiKeyProvider = apiKeyProvider;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.fetchImpl = fetchImpl;
  }

  async listWorkspaces(): Promise<OrgoWorkspaceSummary[]> {
    const response = await this.request<ProjectListResponse>("projects", { method: "GET" });
    return response.projects.map((project) => ({
      id: project.id,
      name: project.name,
      computers: (project.desktops ?? []).map((desktop) => ({
        id: desktop.id,
        name: desktop.name?.trim() || "Untitled",
        status: desktop.status?.trim() || "unknown"
      }))
    }));
  }

  async createComputer(request: CreateOrgoComputerRequest): Promise<OrgoComputerSummary> {
    const response = await this.request<CreateComputerResponse>("computers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: request.workspaceId,
        name: request.computerName,
        os: "linux",
        ram: 8,
        cpu: 4,
        gpu: "none",
        disk_size_gb: 50,
        resolution: "1280x720x24"
      })
    });

    return {
      id: response.id,
      name: response.name?.trim() || request.computerName,
      status: response.status?.trim() || "creating"
    };
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const apiKey = this.apiKeyProvider()?.trim();
    if (!apiKey) {
      throw new Error("No Orgo API key configured.");
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers ?? {})
    };

    const response = await this.fetchImpl(`${this.baseUrl}/${path}`, {
      ...init,
      headers
    });

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = await response.json() as { error?: string; message?: string };
        detail = body.error ?? body.message ?? detail;
      } catch {
        detail = `HTTP ${response.status}`;
      }
      throw new Error(`Orgo request failed: ${detail}`);
    }

    return response.json() as Promise<T>;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/main/orgoClient.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Orgo client**

```bash
git add src/main/orgoClient.ts src/main/orgoClient.test.ts
git commit -m "feat: add Orgo catalog client"
```

---

### Task 3: Encrypted Credential Store

**Files:**
- Create: `src/main/credentialStore.ts`
- Create: `src/main/credentialStore.test.ts`

- [ ] **Step 1: Write failing credential store tests**

Create `src/main/credentialStore.test.ts`:

```ts
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createEncryptedFileCredentialStore } from "./credentialStore.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "os1-credentials-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("encrypted file credential store", () => {
  it("trims, encrypts, loads, and clears credentials", async () => {
    const store = createEncryptedFileCredentialStore({
      filePath: join(dir, "orgo-key.json"),
      cipher: {
        encryptString: (value) => Buffer.from(`encrypted:${value}`, "utf8"),
        decryptString: (value) => value.toString("utf8").replace("encrypted:", "")
      }
    });

    await store.save(" sk-live ");

    await expect(store.hasValue()).resolves.toBe(true);
    await expect(store.load()).resolves.toBe("sk-live");

    await store.clear();

    await expect(store.hasValue()).resolves.toBe(false);
    await expect(store.load()).resolves.toBeUndefined();
  });

  it("treats empty saves as clear", async () => {
    const store = createEncryptedFileCredentialStore({
      filePath: join(dir, "orgo-key.json"),
      cipher: {
        encryptString: (value) => Buffer.from(value, "utf8"),
        decryptString: (value) => value.toString("utf8")
      }
    });

    await store.save("sk-live");
    await store.save(" ");

    await expect(store.hasValue()).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/main/credentialStore.test.ts`

Expected: FAIL because `src/main/credentialStore.ts` does not exist.

- [ ] **Step 3: Implement `src/main/credentialStore.ts`**

```ts
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

interface CredentialCipher {
  encryptString(value: string): Buffer;
  decryptString(value: Buffer): string;
}

export interface CredentialStore {
  hasValue(): Promise<boolean>;
  load(): Promise<string | undefined>;
  save(value: string): Promise<void>;
  clear(): Promise<void>;
}

interface StoreOptions {
  filePath: string;
  cipher: CredentialCipher;
}

export function createEncryptedFileCredentialStore({ filePath, cipher }: StoreOptions): CredentialStore {
  return {
    async hasValue(): Promise<boolean> {
      return (await this.load()) !== undefined;
    },

    async load(): Promise<string | undefined> {
      try {
        const raw = JSON.parse(await readFile(filePath, "utf8")) as { value?: string };
        if (!raw.value) {
          return undefined;
        }
        const decrypted = cipher.decryptString(Buffer.from(raw.value, "base64")).trim();
        return decrypted || undefined;
      } catch {
        return undefined;
      }
    },

    async save(value: string): Promise<void> {
      const trimmed = value.trim();
      if (!trimmed) {
        await this.clear();
        return;
      }

      await mkdir(dirname(filePath), { recursive: true });
      const encrypted = cipher.encryptString(trimmed).toString("base64");
      await writeFile(filePath, JSON.stringify({ value: encrypted }, null, 2), "utf8");
    },

    async clear(): Promise<void> {
      await rm(filePath, { force: true });
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/main/credentialStore.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit credential store**

```bash
git add src/main/credentialStore.ts src/main/credentialStore.test.ts
git commit -m "feat: add encrypted credential storage"
```

---

### Task 4: Main IPC Orgo Handlers

**Files:**
- Modify: `src/main/appPaths.ts`
- Modify: `src/main/ipc.ts`
- Modify: `src/preload/index.ts`
- Test: existing tests plus typecheck

- [ ] **Step 1: Add credential path**

Add `orgoApiKey: string` to `OS1AppPaths` and return `join(appData, "secure", "orgo-api-key.json")`.

- [ ] **Step 2: Wire main IPC handlers**

In `src/main/ipc.ts`, import `safeStorage`, `createEncryptedFileCredentialStore`, `OrgoClient`, and the new validators. Create:

```ts
function createOrgoCredentialStore() {
  return createEncryptedFileCredentialStore({
    filePath: getOS1AppPaths().orgoApiKey,
    cipher: {
      encryptString: (value) => safeStorage.encryptString(value),
      decryptString: (value) => safeStorage.decryptString(value)
    }
  });
}

function createOrgoClient() {
  const credentialStore = createOrgoCredentialStore();
  return new OrgoClient({ apiKeyProvider: () => undefined, fetchImpl: fetch });
}
```

Then adjust `createOrgoClient` so `apiKeyProvider` reads the loaded key in each handler before making client calls:

```ts
async function withOrgoClient<T>(operation: (client: OrgoClient) => Promise<T>): Promise<T> {
  const credentialStore = createOrgoCredentialStore();
  const apiKey = await credentialStore.load();
  const client = new OrgoClient({ apiKeyProvider: () => apiKey, fetchImpl: fetch });
  return operation(client);
}
```

Add handlers:

```ts
ipcMain.handle(ipcChannels.orgoCredentialStatus, async () => ({
  hasApiKey: await createOrgoCredentialStore().hasValue()
}));

ipcMain.handle(ipcChannels.orgoSaveApiKey, async (_event, payload: unknown) => {
  const apiKey = String((payload as { apiKey?: unknown } | undefined)?.apiKey ?? "").trim();
  if (!apiKey) {
    throw new Error("Orgo API key is required.");
  }
  const credentialStore = createOrgoCredentialStore();
  await credentialStore.save(apiKey);
  await withOrgoClient((client) => client.listWorkspaces());
  return { hasApiKey: true };
});

ipcMain.handle(ipcChannels.orgoClearApiKey, async () => {
  await createOrgoCredentialStore().clear();
  return { hasApiKey: false };
});

ipcMain.handle(ipcChannels.orgoListWorkspaces, async () =>
  withOrgoClient((client) => client.listWorkspaces())
);

ipcMain.handle(ipcChannels.orgoCreateComputer, async (_event, payload: unknown) => {
  const request = assertCreateOrgoComputerRequest(payload);
  return withOrgoClient((client) => client.createComputer(request));
});

ipcMain.handle(ipcChannels.connectionsSaveOrgo, async (_event, payload: unknown): Promise<ConnectionSummary> => {
  const draft = assertOrgoConnectionDraft(payload);
  const connections = await readConnections();
  const connection: ConnectionSummary = {
    label: draft.label,
    transport: "orgo",
    destination: `${draft.workspaceName} / ${draft.computerName}`,
    workspaceId: draft.workspaceId,
    workspaceName: draft.workspaceName,
    computerId: draft.computerId,
    computerName: draft.computerName,
    id: randomUUID(),
    createdAt: new Date().toISOString()
  };
  await writeConnections([connection, ...connections]);
  return connection;
});
```

- [ ] **Step 3: Expose preload methods**

Update `src/preload/index.ts` with:

```ts
  orgo: {
    credentialStatus: () => ipcRenderer.invoke(ipcChannels.orgoCredentialStatus),
    saveApiKey: (request) => ipcRenderer.invoke(ipcChannels.orgoSaveApiKey, request),
    clearApiKey: () => ipcRenderer.invoke(ipcChannels.orgoClearApiKey),
    listWorkspaces: () => ipcRenderer.invoke(ipcChannels.orgoListWorkspaces),
    createComputer: (request) => ipcRenderer.invoke(ipcChannels.orgoCreateComputer, request)
  }
```

and add `saveOrgo` to `connections`.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit IPC handlers**

```bash
git add src/main/appPaths.ts src/main/ipc.ts src/preload/index.ts
git commit -m "feat: wire Orgo IPC handlers"
```

---

### Task 5: Connections UI Orgo Flow

**Files:**
- Modify: `src/renderer/views/ConnectionsView.tsx`
- Create: `src/renderer/views/ConnectionsView.test.tsx`
- Modify: `src/renderer/App.test.tsx`
- Modify: `src/renderer/styles/global.css`

- [ ] **Step 1: Write failing Connections UI tests**

Create `src/renderer/views/ConnectionsView.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectionsView } from "./ConnectionsView";

beforeEach(() => {
  window.os1 = {
    app: {
      info: vi.fn(),
      diagnostics: vi.fn()
    },
    orgo: {
      credentialStatus: vi.fn().mockResolvedValue({ hasApiKey: false }),
      saveApiKey: vi.fn().mockResolvedValue({ hasApiKey: true }),
      clearApiKey: vi.fn().mockResolvedValue({ hasApiKey: false }),
      listWorkspaces: vi.fn().mockResolvedValue([
        {
          id: "workspace-1",
          name: "Main",
          computers: [{ id: "computer-1", name: "Hermes", status: "running" }]
        }
      ]),
      createComputer: vi.fn().mockResolvedValue({ id: "computer-2", name: "New VM", status: "creating" })
    },
    connections: {
      list: vi.fn().mockResolvedValue([]),
      saveDraft: vi.fn(),
      saveOrgo: vi.fn().mockResolvedValue({
        id: "connection-1",
        label: "Hermes",
        transport: "orgo",
        destination: "Main / Hermes",
        createdAt: "2026-05-13T00:00:00.000Z"
      })
    }
  };
});

describe("ConnectionsView", () => {
  it("saves an Orgo API key and loads workspaces", async () => {
    const user = userEvent.setup();
    render(<ConnectionsView />);

    await user.type(screen.getByLabelText("Orgo API Key"), "sk-live");
    await user.click(screen.getByRole("button", { name: "Verify & Save" }));

    await waitFor(() => expect(window.os1.orgo.saveApiKey).toHaveBeenCalledWith({ apiKey: "sk-live" }));
    expect(await screen.findByText("Main")).toBeInTheDocument();
  });

  it("saves selected workspace and computer as an Orgo connection", async () => {
    const user = userEvent.setup();
    render(<ConnectionsView />);

    await user.click(await screen.findByRole("button", { name: "Load Workspaces" }));
    await user.click(await screen.findByRole("button", { name: "Save Connection" }));

    await waitFor(() =>
      expect(window.os1.connections.saveOrgo).toHaveBeenCalledWith({
        label: "Hermes",
        workspaceId: "workspace-1",
        workspaceName: "Main",
        computerId: "computer-1",
        computerName: "Hermes"
      })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/renderer/views/ConnectionsView.test.tsx`

Expected: FAIL because the UI still has the draft form.

- [ ] **Step 3: Implement Orgo setup UI**

Replace `ConnectionsView` with a component that:

- Loads saved connections and credential status on mount.
- Shows an `Orgo API Key` password input.
- Has `Verify & Save`, `Clear Key`, and `Load Workspaces` buttons.
- Renders workspace buttons/cards from `window.os1.orgo.listWorkspaces()`.
- Selects the first workspace and first computer by default after load.
- Has `Computer name` input and `Create Computer` button.
- Has `Connection name` input and `Save Connection` button.
- Calls `window.os1.connections.saveOrgo` with sanitized selected workspace/computer fields.
- Updates local connection list after save.

Use `aria-label="Orgo API Key"` for the password input and visible button labels exactly as the tests expect.

- [ ] **Step 4: Update App test mock**

Add `orgo` methods and `connections.saveOrgo` to the `window.os1` mock in `src/renderer/App.test.tsx`.

- [ ] **Step 5: Add focused CSS**

Add classes in `src/renderer/styles/global.css` for:

- `.orgo-setup-grid`
- `.orgo-actions`
- `.workspace-list`
- `.workspace-card`
- `.workspace-card--selected`
- `.computer-list`
- `.computer-row`
- `.computer-row--selected`

Keep 8px radius, cream/coral palette, and no nested card-in-card styling beyond functional repeated items.

- [ ] **Step 6: Run tests**

Run: `npm run test -- src/renderer/views/ConnectionsView.test.tsx src/renderer/App.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit Connections UI**

```bash
git add src/renderer/views/ConnectionsView.tsx src/renderer/views/ConnectionsView.test.tsx src/renderer/App.test.tsx src/renderer/styles/global.css
git commit -m "feat: build Orgo connection setup UI"
```

---

### Task 6: Docs, Verification, And Push

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README status**

Move these items from upcoming to current:

- Orgo API key verification and secure credential storage
- Workspace and computer picker

Keep Hermes Agent install and terminal in upcoming.

- [ ] **Step 2: Run full verification**

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

Run: `npm run build:win`

Expected: PASS and writes `release/Hermes-OS1-Windows-0.1.0-x64.exe`.

- [ ] **Step 3: Commit README**

```bash
git add README.md
git commit -m "docs: update Orgo connection status"
```

- [ ] **Step 4: Push**

```bash
git push origin main
```

Expected: `origin/main` contains the Orgo connection setup slice.

## Self-Review

Spec coverage:

- Covers Orgo API key save/verify, workspace list, computer list, create computer, active connection metadata, and secure credential storage.
- Does not cover Hermes Agent install or terminal because those are Milestone 3.

Placeholder scan:

- No placeholder markers, no incomplete file paths, and no undefined task boundaries.

Type consistency:

- `OrgoWorkspaceSummary`, `OrgoComputerSummary`, `CreateOrgoComputerRequest`, and `OrgoConnectionDraft` are defined in shared IPC before renderer/main usage.
- Renderer never receives or stores the raw Orgo API key after submit.
