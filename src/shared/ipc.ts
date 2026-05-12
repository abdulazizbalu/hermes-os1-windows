export const ipcChannels = {
  appInfo: "app:info",
  diagnostics: "app:diagnostics",
  connectionsList: "connections:list",
  connectionsSaveDraft: "connections:saveDraft"
} as const;

export interface AppInfo {
  name: string;
  version: string;
  platform: NodeJS.Platform;
  appDataPath: string;
}

export interface ConnectionDraft {
  label: string;
  transport: "orgo" | "ssh";
  destination: string;
}

export interface ConnectionSummary extends ConnectionDraft {
  id: string;
  createdAt: string;
}

export interface OS1Api {
  app: {
    info(): Promise<AppInfo>;
    diagnostics(): Promise<string>;
  };
  connections: {
    list(): Promise<ConnectionSummary[]>;
    saveDraft(draft: ConnectionDraft): Promise<ConnectionSummary>;
  };
}

export function assertConnectionDraft(value: unknown): ConnectionDraft {
  if (!value || typeof value !== "object") {
    throw new Error("Connection draft must be an object.");
  }

  const candidate = value as Record<string, unknown>;
  const label = String(candidate.label ?? "").trim();
  const destination = String(candidate.destination ?? "").trim();
  const transport = candidate.transport;

  if (!label) {
    throw new Error("Connection label is required.");
  }

  if (transport !== "orgo" && transport !== "ssh") {
    throw new Error("Connection transport must be orgo or ssh.");
  }

  if (!destination) {
    throw new Error("Connection destination is required.");
  }

  return { label, transport, destination };
}
