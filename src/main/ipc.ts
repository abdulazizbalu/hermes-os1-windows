import { app, ipcMain } from "electron";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  AppInfo,
  ConnectionSummary,
  assertConnectionDraft,
  ipcChannels
} from "../shared/ipc.js";
import { getOS1AppPaths } from "./appPaths.js";

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
}
