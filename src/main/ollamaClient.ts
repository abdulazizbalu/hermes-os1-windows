import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { gemmaModelIds } from "../shared/ipc.js";
import type { GemmaModelId, LocalAiStatus } from "../shared/ipc.js";

interface CommandResult {
  stdout: string;
  stderr: string;
}

type RunCommand = (command: string, args: string[]) => Promise<CommandResult>;

interface OllamaClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  runCommand?: RunCommand;
}

interface TagsResponse {
  models?: Array<{
    name?: string;
    model?: string;
    size?: number;
  }>;
}

interface PullResponse {
  status: string;
}

interface GenerateResponse {
  response: string;
}

const execFileAsync = promisify(execFile);

async function defaultRunCommand(command: string, args: string[]): Promise<CommandResult> {
  const result = await execFileAsync(command, args, { windowsHide: true });
  return {
    stdout: result.stdout,
    stderr: result.stderr
  };
}

export class OllamaClient {
  private readonly baseUrl: string;
  private readonly serverUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly runCommand: RunCommand;

  constructor({ baseUrl = "http://127.0.0.1:11434/api", fetchImpl = fetch, runCommand = defaultRunCommand }: OllamaClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.serverUrl = this.baseUrl.replace(/\/api$/, "");
    this.fetchImpl = fetchImpl;
    this.runCommand = runCommand;
  }

  async status(selectedModel: GemmaModelId = "gemma4:e4b"): Promise<LocalAiStatus> {
    const version = await this.detectVersion();

    try {
      const response = await this.fetchImpl(`${this.baseUrl}/tags`, { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const body = (await response.json()) as TagsResponse;
      const installedModels = new Map(
        (body.models ?? []).map((model) => [model.name ?? model.model ?? "", model.size] as const)
      );

      return {
        ollamaInstalled: true,
        ollamaRunning: true,
        recommendedModel: "gemma4:e4b",
        selectedModel,
        version,
        models: gemmaModelIds.map((model) => ({
          name: model,
          installed: installedModels.has(model),
          ...(installedModels.get(model) ? { size: installedModels.get(model) } : {})
        }))
      };
    } catch {
      return {
        ollamaInstalled: version !== undefined,
        ollamaRunning: false,
        recommendedModel: "gemma4:e4b",
        selectedModel,
        ...(version ? { version } : {}),
        error: `Ollama is not running on ${this.serverUrl}.`,
        models: gemmaModelIds.map((model) => ({ name: model, installed: false }))
      };
    }
  }

  async pullModel(model: GemmaModelId): Promise<PullResponse> {
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, stream: false })
      });
    } catch {
      throw new Error(`Ollama is not running on ${this.serverUrl}.`);
    }

    if (!response.ok) {
      throw new Error(`Ollama pull failed: HTTP ${response.status}`);
    }

    return response.json() as Promise<PullResponse>;
  }

  async generateText(model: GemmaModelId, prompt: string): Promise<GenerateResponse> {
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          system: "Отвечай только на русском языке. Пиши ясно, дружелюбно и кратко.",
          stream: false
        })
      });
    } catch {
      throw new Error(`Ollama is not running on ${this.serverUrl}.`);
    }

    if (!response.ok) {
      throw new Error(`Ollama generation failed: HTTP ${response.status}`);
    }

    return response.json() as Promise<GenerateResponse>;
  }

  private async detectVersion(): Promise<string | undefined> {
    try {
      const result = await this.runCommand("ollama", ["--version"]);
      const output = `${result.stdout}\n${result.stderr}`.trim();
      return output.match(/(\d+\.\d+\.\d+)/)?.[1] ?? (output || undefined);
    } catch {
      return undefined;
    }
  }
}
