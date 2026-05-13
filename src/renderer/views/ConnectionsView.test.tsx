import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectionsView } from "./ConnectionsView";

beforeEach(() => {
  window.os1 = {
    app: {
      info: vi.fn(),
      diagnostics: vi.fn()
    },
    connections: {
      list: vi.fn().mockResolvedValue([]),
      saveDraft: vi.fn(),
      saveLocal: vi.fn().mockResolvedValue({
        id: "connection-1",
        label: "Локальная Gemma",
        transport: "local",
        destination: "WINDOWS / gemma4:e4b",
        model: "gemma4:e4b",
        runtime: "windows",
        workspacePath: "C:\\Users\\User",
        createdAt: "2026-05-13T00:00:00.000Z"
      })
    },
    localAi: {
      status: vi.fn().mockResolvedValue({
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
      }),
      pullModel: vi.fn().mockResolvedValue({
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
      }),
      generateText: vi.fn().mockResolvedValue({ response: "Готово, отвечаю по-русски." })
    }
  };
});

describe("ConnectionsView", () => {
  it("detects Ollama, pulls the starter Gemma model, and checks Russian", async () => {
    const user = userEvent.setup();
    render(<ConnectionsView />);

    await user.click(await screen.findByRole("button", { name: "Проверить Ollama" }));
    await user.click(screen.getByRole("button", { name: "Подготовить Gemma 4 E4B" }));
    await user.click(screen.getByRole("button", { name: "Проверить русский" }));

    await waitFor(() => expect(window.os1.localAi.pullModel).toHaveBeenCalledWith({ model: "gemma4:e4b" }));
    await waitFor(() =>
      expect(window.os1.localAi.generateText).toHaveBeenCalledWith({
        model: "gemma4:e4b",
        prompt: "Скажи по-русски, что Gemma 4 готова к работе."
      })
    );
    expect(await screen.findByText("Ollama 0.12.0")).toBeInTheDocument();
    expect(await screen.findByText("Готово, отвечаю по-русски.")).toBeInTheDocument();
  });

  it("saves a Local Gemma workspace connection", async () => {
    const user = userEvent.setup();
    render(<ConnectionsView />);

    await user.clear(screen.getByLabelText("Папка workspace"));
    await user.type(screen.getByLabelText("Папка workspace"), "C:\\Users\\User");
    await user.click(await screen.findByRole("button", { name: "Сохранить локальный workspace" }));

    await waitFor(() =>
      expect(window.os1.connections.saveLocal).toHaveBeenCalledWith({
        label: "Локальная Gemma",
        runtime: "windows",
        model: "gemma4:e4b",
        workspacePath: "C:\\Users\\User"
      })
    );
  });
});
