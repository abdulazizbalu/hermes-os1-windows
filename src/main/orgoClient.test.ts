import { describe, expect, it, vi } from "vitest";
import { OrgoClient } from "./orgoClient.js";

describe("OrgoClient", () => {
  it("lists projects as OS1 workspaces with nested computers", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        projects: [
          {
            id: "workspace-1",
            name: "Main",
            desktops: [{ id: "computer-1", name: "", status: "running" }]
          }
        ]
      })
    });

    const client = new OrgoClient({ apiKeyProvider: () => "sk-orgo", fetchImpl: fetchImpl as unknown as typeof fetch });

    await expect(client.listWorkspaces()).resolves.toEqual([
      {
        id: "workspace-1",
        name: "Main",
        computers: [{ id: "computer-1", name: "Untitled", status: "running" }]
      }
    ]);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://www.orgo.ai/api/projects",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer sk-orgo" }
      })
    );
  });

  it("creates computers with the macOS OS1 defaults", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "computer-2", name: "Hermes", status: "creating" })
    });

    const client = new OrgoClient({ apiKeyProvider: () => "sk-orgo", fetchImpl: fetchImpl as unknown as typeof fetch });

    await expect(client.createComputer({ workspaceId: "workspace-1", computerName: "Hermes" })).resolves.toEqual({
      id: "computer-2",
      name: "Hermes",
      status: "creating"
    });
    expect(JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))).toEqual({
      workspace_id: "workspace-1",
      name: "Hermes",
      os: "linux",
      ram: 8,
      cpu: 4,
      gpu: "none",
      disk_size_gb: 50,
      resolution: "1280x720x24"
    });
  });

  it("rejects missing API keys before making requests", async () => {
    const fetchImpl = vi.fn();
    const client = new OrgoClient({ apiKeyProvider: () => "", fetchImpl: fetchImpl as unknown as typeof fetch });

    await expect(client.listWorkspaces()).rejects.toThrow("No Orgo API key configured.");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
