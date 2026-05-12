import { app } from "electron";
import { join } from "node:path";

export interface OS1AppPaths {
  appData: string;
  logs: string;
  connections: string;
}

export function getOS1AppPaths(): OS1AppPaths {
  const appData = app.getPath("userData");

  return {
    appData,
    logs: join(appData, "logs"),
    connections: join(appData, "connections.json")
  };
}
