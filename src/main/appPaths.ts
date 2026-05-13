import { app } from "electron";
import { join } from "node:path";

export interface NurAppPaths {
  appData: string;
  logs: string;
  history: string;
}

export function getNurAppPaths(): NurAppPaths {
  const appData = app.getPath("userData");

  return {
    appData,
    logs: join(appData, "logs"),
    history: join(appData, "history.json")
  };
}

export const getOS1AppPaths = getNurAppPaths;
