import type { CreateOrgoComputerRequest, OrgoComputerSummary, OrgoWorkspaceSummary } from "../shared/ipc.js";

interface OrgoClientOptions {
  apiKeyProvider(): string | undefined;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

interface ProjectListResponse {
  projects: Array<{
    id: string;
    name: string;
    desktops?: Array<{
      id: string;
      name?: string | null;
      status?: string | null;
    }>;
  }>;
}

interface CreateComputerResponse {
  id: string;
  name?: string | null;
  status?: string | null;
}

export class OrgoClient {
  private readonly apiKeyProvider: () => string | undefined;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor({ apiKeyProvider, baseUrl = "https://www.orgo.ai/api", fetchImpl = fetch }: OrgoClientOptions) {
    this.apiKeyProvider = apiKeyProvider;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.fetchImpl = fetchImpl;
  }

  async listWorkspaces(): Promise<OrgoWorkspaceSummary[]> {
    const response = await this.request<ProjectListResponse>("projects", { method: "GET" });
    return response.projects.map((project) => ({
      id: project.id,
      name: project.name,
      computers: (project.desktops ?? []).map((desktop) => ({
        id: desktop.id,
        name: desktop.name?.trim() || "Untitled",
        status: desktop.status?.trim() || "unknown"
      }))
    }));
  }

  async createComputer(request: CreateOrgoComputerRequest): Promise<OrgoComputerSummary> {
    const response = await this.request<CreateComputerResponse>("computers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: request.workspaceId,
        name: request.computerName,
        os: "linux",
        ram: 8,
        cpu: 4,
        gpu: "none",
        disk_size_gb: 50,
        resolution: "1280x720x24"
      })
    });

    return {
      id: response.id,
      name: response.name?.trim() || request.computerName,
      status: response.status?.trim() || "creating"
    };
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const apiKey = this.apiKeyProvider()?.trim();
    if (!apiKey) {
      throw new Error("No Orgo API key configured.");
    }

    const response = await this.fetchImpl(`${this.baseUrl}/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = (await response.json()) as { error?: string; message?: string };
        detail = body.error ?? body.message ?? detail;
      } catch {
        detail = `HTTP ${response.status}`;
      }
      throw new Error(`Orgo request failed: ${detail}`);
    }

    return response.json() as Promise<T>;
  }
}
