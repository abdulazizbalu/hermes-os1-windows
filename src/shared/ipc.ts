export const ipcChannels = {
  appInfo: "app:info",
  diagnostics: "app:diagnostics",
  localAiStatus: "localAi:status",
  localAiStartOllama: "localAi:startOllama",
  localAiPullModel: "localAi:pullModel",
  localAiGenerateText: "localAi:generateText"
} as const;

export interface AppInfo {
  name: string;
  version: string;
  platform: NodeJS.Platform;
  appDataPath: string;
}

export const gemmaModelIds = ["gemma4:e2b", "gemma4:e4b", "gemma4:26b"] as const;

export type GemmaModelId = (typeof gemmaModelIds)[number];

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

export interface GenerateLocalTextRequest {
  model: GemmaModelId;
  prompt: string;
}

export interface GenerateLocalTextResponse {
  response: string;
}

export interface NurApi {
  app: {
    info(): Promise<AppInfo>;
    diagnostics(): Promise<string>;
  };
  localAi: {
    status(): Promise<LocalAiStatus>;
    startOllama(): Promise<LocalAiStatus>;
    pullModel(request: PullLocalModelRequest): Promise<LocalAiStatus>;
    generateText(request: GenerateLocalTextRequest): Promise<GenerateLocalTextResponse>;
  };
}

export type OS1Api = NurApi;

function requiredTrimmedString(value: unknown, message: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(message);
  }
  return text;
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

export function assertGenerateLocalTextRequest(value: unknown): GenerateLocalTextRequest {
  if (!value || typeof value !== "object") {
    throw new Error("Generate text request must be an object.");
  }

  const candidate = value as Record<string, unknown>;
  const model = requiredTrimmedString(candidate.model, "Gemma model is required.");
  if (!isGemmaModelId(model)) {
    throw new Error("Gemma model must be gemma4:e2b, gemma4:e4b, or gemma4:26b.");
  }

  return {
    model,
    prompt: requiredTrimmedString(candidate.prompt, "Prompt is required.")
  };
}

function isGemmaModelId(model: string): model is GemmaModelId {
  return gemmaModelIds.includes(model as GemmaModelId);
}
