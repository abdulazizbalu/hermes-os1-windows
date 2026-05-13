import { describe, expect, it, vi } from "vitest";
import { OllamaClient } from "./ollamaClient.js";

describe("OllamaClient", () => {
  it("reports installed Gemma models from Ollama tags", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        models: [
          { name: "gemma4:e4b", size: 9600000000 },
          { model: "llama3.2", size: 2000000000 }
        ]
      })
    });
    const runCommand = vi.fn().mockResolvedValue({ stdout: "ollama version is 0.12.0", stderr: "" });
    const client = new OllamaClient({ fetchImpl: fetchImpl as unknown as typeof fetch, runCommand });

    await expect(client.status()).resolves.toEqual({
      ollamaInstalled: true,
      ollamaRunning: true,
      recommendedModel: "gemma4:e4b",
      selectedModel: "gemma4:e4b",
      version: "0.12.0",
      models: [
        { name: "gemma4:e2b", installed: false },
        { name: "gemma4:e4b", installed: true, size: 9600000000 },
        { name: "gemma4:26b", installed: false }
      ]
    });
    expect(fetchImpl).toHaveBeenCalledWith("http://127.0.0.1:11434/api/tags", { method: "GET" });
  });

  it("reports stopped Ollama without throwing", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));
    const runCommand = vi.fn().mockRejectedValue(new Error("not found"));
    const client = new OllamaClient({ fetchImpl: fetchImpl as unknown as typeof fetch, runCommand });

    await expect(client.status("gemma4:e2b")).resolves.toEqual({
      ollamaInstalled: false,
      ollamaRunning: false,
      recommendedModel: "gemma4:e4b",
      selectedModel: "gemma4:e2b",
      error: "Ollama не запущен на http://127.0.0.1:11434.",
      models: [
        { name: "gemma4:e2b", installed: false },
        { name: "gemma4:e4b", installed: false },
        { name: "gemma4:26b", installed: false }
      ]
    });
  });

  it("pulls Gemma models with non-streaming Ollama API", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "success" })
    });
    const client = new OllamaClient({ fetchImpl: fetchImpl as unknown as typeof fetch, runCommand: vi.fn() });

    await expect(client.pullModel("gemma4:e4b")).resolves.toEqual({ status: "success" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://127.0.0.1:11434/api/pull",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gemma4:e4b", stream: false })
      })
    );
  });

  it("starts Ollama serve and returns the refreshed local status", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        models: [{ name: "gemma4:e4b", size: 9600000000 }]
      })
    });
    const runCommand = vi.fn().mockResolvedValue({ stdout: "ollama version is 0.12.0", stderr: "" });
    const startCommand = vi.fn().mockResolvedValue(undefined);
    const client = new OllamaClient({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      runCommand,
      startCommand,
      waitForServerMs: 1
    });

    await expect(client.startServer()).resolves.toMatchObject({
      ollamaInstalled: true,
      ollamaRunning: true,
      selectedModel: "gemma4:e4b"
    });
    expect(startCommand).toHaveBeenCalledWith("ollama", ["serve"]);
  });

  it("generates Russian text with a Russian system prompt", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ response: "Готово, отвечаю по-русски." })
    });
    const client = new OllamaClient({ fetchImpl: fetchImpl as unknown as typeof fetch, runCommand: vi.fn() });

    await expect(client.generateText("gemma4:e2b", "Проверь русский язык.")).resolves.toEqual({
      response: "Готово, отвечаю по-русски."
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://127.0.0.1:11434/api/generate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma4:e2b",
          prompt: "Проверь русский язык.",
          system: "Ты — Nur, локальный AI-помощник для офисных задач. Отвечай по-русски ясно, дружелюбно и кратко.",
          stream: false
        })
      })
    );
  });

  it("throws a clear error when pulling without a running Ollama server", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));
    const client = new OllamaClient({ fetchImpl: fetchImpl as unknown as typeof fetch, runCommand: vi.fn() });

    await expect(client.pullModel("gemma4:e4b")).rejects.toThrow(
      "Ollama не запущен на http://127.0.0.1:11434."
    );
  });
});
