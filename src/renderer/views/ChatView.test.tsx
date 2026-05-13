import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatView } from "./ChatView";

beforeEach(() => {
  window.os1 = {
    app: {
      info: vi.fn(),
      diagnostics: vi.fn()
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
      startOllama: vi.fn(),
      pullModel: vi.fn(),
      generateText: vi.fn().mockResolvedValue({ response: "Привет! Чем помочь?" })
    },
    history: {
      list: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockImplementation(async (c) => c),
      delete: vi.fn(),
      clear: vi.fn()
    }
  };
});

describe("ChatView", () => {
  it("sends a user message and renders the assistant response", async () => {
    const user = userEvent.setup();
    render(<ChatView />);

    await waitFor(() => expect(screen.getByText("ГОТОВ К РАБОТЕ")).toBeInTheDocument());

    const input = screen.getByPlaceholderText("Напишите сообщение...");
    await user.type(input, "Привет");
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    await waitFor(() =>
      expect(window.os1.localAi.generateText).toHaveBeenCalledWith({
        model: "gemma4:e4b",
        prompt: "Привет"
      })
    );

    expect(await screen.findByText("Привет! Чем помочь?")).toBeInTheDocument();
    expect(screen.getByText("Привет")).toBeInTheDocument();
  });

  it("disables sending when Ollama is not running", async () => {
    vi.mocked(window.os1.localAi.status).mockResolvedValueOnce({
      ollamaInstalled: true,
      ollamaRunning: false,
      recommendedModel: "gemma4:e4b",
      selectedModel: "gemma4:e4b",
      models: []
    });
    render(<ChatView />);

    await waitFor(() => expect(screen.getByText("OLLAMA ВЫКЛ")).toBeInTheDocument());

    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
    expect(screen.getByPlaceholderText("Подготовьте Gemma в разделе «Настройки»")).toBeDisabled();
  });
});
