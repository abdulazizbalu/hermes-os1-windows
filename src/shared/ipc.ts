export const ipcChannels = {
  appInfo: "app:info",
  diagnostics: "app:diagnostics",
  connectionsList: "connections:list",
  connectionsSaveDraft: "connections:saveDraft",
  connectionsSaveOrgo: "connections:saveOrgo",
  orgoCredentialStatus: "orgo:credentialStatus",
  orgoSaveApiKey: "orgo:saveApiKey",
  orgoClearApiKey: "orgo:clearApiKey",
  orgoListWorkspaces: "orgo:listWorkspaces",
  orgoCreateComputer: "orgo:createComputer"
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

export interface ConnectionSummary extends ConnectionDraft {
  id: string;
  createdAt: string;
  workspaceId?: string;
  workspaceName?: string;
  computerId?: string;
  computerName?: string;
}

export interface OS1Api {
  app: {
    info(): Promise<AppInfo>;
    diagnostics(): Promise<string>;
  };
  connections: {
    list(): Promise<ConnectionSummary[]>;
    saveDraft(draft: ConnectionDraft): Promise<ConnectionSummary>;
    saveOrgo(draft: OrgoConnectionDraft): Promise<ConnectionSummary>;
  };
  orgo: {
    credentialStatus(): Promise<OrgoCredentialStatus>;
    saveApiKey(request: SaveOrgoApiKeyRequest): Promise<OrgoCredentialStatus>;
    clearApiKey(): Promise<OrgoCredentialStatus>;
    listWorkspaces(): Promise<OrgoWorkspaceSummary[]>;
    createComputer(request: CreateOrgoComputerRequest): Promise<OrgoComputerSummary>;
  };
}

function requiredTrimmedString(value: unknown, message: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(message);
  }
  return text;
}

export function assertConnectionDraft(value: unknown): ConnectionDraft {
  if (!value || typeof value !== "object") {
    throw new Error("Connection draft must be an object.");
  }

  const candidate = value as Record<string, unknown>;
  const label = requiredTrimmedString(candidate.label, "Connection label is required.");
  const destination = requiredTrimmedString(candidate.destination, "Connection destination is required.");
  const transport = candidate.transport;

  if (transport !== "orgo" && transport !== "ssh") {
    throw new Error("Connection transport must be orgo or ssh.");
  }

  return { label, transport, destination };
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
