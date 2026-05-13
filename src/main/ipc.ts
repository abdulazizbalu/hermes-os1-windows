import { app, ipcMain } from "electron";
import {
  assertGenerateLocalTextRequest,
  assertPullLocalModelRequest,
  ipcChannels
} from "../shared/ipc.js";
import type { AppInfo } from "../shared/ipc.js";
import { getNurAppPaths } from "./appPaths.js";
import { OllamaClient } from "./ollamaClient.js";

export function registerIpcHandlers(): void {
  ipcMain.handle(ipcChannels.appInfo, (): AppInfo => {
    const paths = getNurAppPaths();

    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      appDataPath: paths.appData
    };
  });

  ipcMain.handle(ipcChannels.diagnostics, async (): Promise<string> => {
    const paths = getNurAppPaths();

    return JSON.stringify(
      {
        app: app.getName(),
        version: app.getVersion(),
        platform: process.platform,
        appDataPath: paths.appData
      },
      null,
      2
    );
  });

  ipcMain.handle(ipcChannels.localAiStatus, async () => {
    return new OllamaClient().status();
  });

  ipcMain.handle(ipcChannels.localAiStartOllama, async () => {
    return new OllamaClient().startServer();
  });

  ipcMain.handle(ipcChannels.localAiPullModel, async (_event, payload: unknown) => {
    const request = assertPullLocalModelRequest(payload);
    const client = new OllamaClient();
    await client.pullModel(request.model);
    return client.status(request.model);
  });

  ipcMain.handle(ipcChannels.localAiGenerateText, async (_event, payload: unknown) => {
    const request = assertGenerateLocalTextRequest(payload);
    return new OllamaClient().generateText(request.model, request.prompt);
  });
}
