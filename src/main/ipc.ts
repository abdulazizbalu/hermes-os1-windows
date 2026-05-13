import { app, ipcMain, safeStorage } from "electron";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  assertConnectionDraft,
  assertCreateOrgoComputerRequest,
  assertOrgoConnectionDraft,
  ipcChannels
} from "../shared/ipc.js";
import type { AppInfo, ConnectionSummary } from "../shared/ipc.js";
import { getOS1AppPaths } from "./appPaths.js";
import { createEncryptedFileCredentialStore } from "./credentialStore.js";
import { OrgoClient } from "./orgoClient.js";

async function readConnections(): Promise<ConnectionSummary[]> {
  const paths = getOS1AppPaths();

  try {
    const raw = await readFile(paths.connections, "utf8");
    const parsed = JSON.parse(raw) as ConnectionSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeConnections(connections: ConnectionSummary[]): Promise<void> {
  const paths = getOS1AppPaths();
  await mkdir(dirname(paths.connections), { recursive: true });
  await writeFile(paths.connections, JSON.stringify(connections, null, 2), "utf8");
}

function createOrgoCredentialStore() {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Secure credential storage is not available on this Windows account.");
  }

  return createEncryptedFileCredentialStore({
    filePath: getOS1AppPaths().orgoApiKey,
    cipher: {
      encryptString: (value) => safeStorage.encryptString(value),
      decryptString: (value) => safeStorage.decryptString(value)
    }
  });
}

async function withOrgoClient<T>(operation: (client: OrgoClient) => Promise<T>): Promise<T> {
  const apiKey = await createOrgoCredentialStore().load();
  const client = new OrgoClient({ apiKeyProvider: () => apiKey, fetchImpl: fetch });
  return operation(client);
}

export function registerIpcHandlers(): void {
  ipcMain.handle(ipcChannels.appInfo, (): AppInfo => {
    const paths = getOS1AppPaths();

    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      appDataPath: paths.appData
    };
  });

  ipcMain.handle(ipcChannels.diagnostics, async (): Promise<string> => {
    const paths = getOS1AppPaths();
    const connections = await readConnections();

    return JSON.stringify(
      {
        app: app.getName(),
        version: app.getVersion(),
        platform: process.platform,
        appDataPath: paths.appData,
        connectionCount: connections.length
      },
      null,
      2
    );
  });

  ipcMain.handle(ipcChannels.connectionsList, async (): Promise<ConnectionSummary[]> => {
    return readConnections();
  });

  ipcMain.handle(ipcChannels.connectionsSaveDraft, async (_event, payload: unknown): Promise<ConnectionSummary> => {
    const draft = assertConnectionDraft(payload);
    const connections = await readConnections();
    const connection: ConnectionSummary = {
      ...draft,
      id: randomUUID(),
      createdAt: new Date().toISOString()
    };

    const next = [connection, ...connections];
    await writeConnections(next);
    return connection;
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

    const next = [connection, ...connections];
    await writeConnections(next);
    return connection;
  });

  ipcMain.handle(ipcChannels.orgoCredentialStatus, async () => ({
    hasApiKey: await createOrgoCredentialStore().hasValue()
  }));

  ipcMain.handle(ipcChannels.orgoSaveApiKey, async (_event, payload: unknown) => {
    const apiKey = String((payload as { apiKey?: unknown } | undefined)?.apiKey ?? "").trim();
    if (!apiKey) {
      throw new Error("Orgo API key is required.");
    }

    const verifier = new OrgoClient({ apiKeyProvider: () => apiKey, fetchImpl: fetch });
    await verifier.listWorkspaces();
    await createOrgoCredentialStore().save(apiKey);

    return { hasApiKey: true };
  });

  ipcMain.handle(ipcChannels.orgoClearApiKey, async () => {
    await createOrgoCredentialStore().clear();
    return { hasApiKey: false };
  });

  ipcMain.handle(ipcChannels.orgoListWorkspaces, async () => {
    return withOrgoClient((client) => client.listWorkspaces());
  });

  ipcMain.handle(ipcChannels.orgoCreateComputer, async (_event, payload: unknown) => {
    const request = assertCreateOrgoComputerRequest(payload);
    return withOrgoClient((client) => client.createComputer(request));
  });
}
