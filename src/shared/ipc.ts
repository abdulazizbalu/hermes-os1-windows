export const ipcChannels = {
  appInfo: "app:info",
  diagnostics: "app:diagnostics",
  connectionsList: "connections:list",
  connectionsSaveDraft: "connections:saveDraft",
  connectionsSaveLocal: "connections:saveLocal",
  localAiStatus: "localAi:status",
  localAiPullModel: "localAi:pullModel"
} as const;

export interface AppInfo {
  name: string;
  version: string;
  platform: NodeJS.Platform;
  appDataPath: string;
}

export interface ConnectionDraft {
  label: string;
  transport: "local" | "wsl" | "ssh";
  destination: string;
}

export const gemmaModelIds = ["gemma4:e2b", "gemma4:e4b", "gemma4:26b"] as const;

export type GemmaModelId = (typeof gemmaModelIds)[number];

export type LocalRuntime = "windows" | "wsl";

export interface LocalAiModelSummary {
  name: string;
  installed: boolean;
  size?: number;
}

export interface LocalAiStatus {
  ollamaInstalled: boolean;
  ollamaRunning: boolean;
  recommendedModel: GemmaModelId;
  selectedModel: GemmaModelId;
  models: LocalAiModelSummary[];
  version?: string;
  error?: string;
}

export interface PullLocalModelRequest {
  model: GemmaModelId;
}

export interface LocalConnectionDraft {
  label: string;
  runtime: LocalRuntime;
  model: GemmaModelId;
  workspacePath: string;
}

export interface ConnectionSummary extends ConnectionDraft {
  id: string;
  createdAt: string;
  runtime?: LocalRuntime;
  model?: GemmaModelId;
  workspacePath?: string;
}

export interface OS1Api {
  app: {
    info(): Promise<AppInfo>;
    diagnostics(): Promise<string>;
  };
  connections: {
    list(): Promise<ConnectionSummary[]>;
    saveDraft(draft: ConnectionDraft): Promise<ConnectionSummary>;
    saveLocal(draft: LocalConnectionDraft): Promise<ConnectionSummary>;
  };
  localAi: {
    status(): Promise<LocalAiStatus>;
    pullModel(request: PullLocalModelRequest): Promise<LocalAiStatus>;
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

  if (transport !== "local" && transport !== "wsl" && transport !== "ssh") {
    throw new Error("Connection transport must be local, wsl, or ssh.");
  }

  return { label, transport, destination };
}

export function assertPullLocalModelRequest(value: unknown): PullLocalModelRequest {
  if (!value || typeof value !== "object") {
    throw new Error("Pull model request must be an object.");
  }

  const candidate = value as Record<string, unknown>;
  const model = requiredTrimmedString(candidate.model, "Gemma model is required.");
  if (!isGemmaModelId(model)) {
    throw new Error("Gemma model must be gemma4:e2b, gemma4:e4b, or gemma4:26b.");
  }

  return {
    model
  };
}

export function assertLocalConnectionDraft(value: unknown): LocalConnectionDraft {
  if (!value || typeof value !== "object") {
    throw new Error("Local connection draft must be an object.");
  }

  const candidate = value as Record<string, unknown>;
  const runtime = requiredTrimmedString(candidate.runtime, "Local runtime is required.");
  const model = requiredTrimmedString(candidate.model, "Gemma model is required.");

  if (runtime !== "windows" && runtime !== "wsl") {
    throw new Error("Local runtime must be windows or wsl.");
  }

  if (!isGemmaModelId(model)) {
    throw new Error("Gemma model must be gemma4:e2b, gemma4:e4b, or gemma4:26b.");
  }

  return {
    label: requiredTrimmedString(candidate.label, "Connection label is required."),
    runtime,
    model,
    workspacePath: requiredTrimmedString(candidate.workspacePath, "Workspace path is required.")
  };
}

function isGemmaModelId(model: string): model is GemmaModelId {
  return gemmaModelIds.includes(model as GemmaModelId);
}
