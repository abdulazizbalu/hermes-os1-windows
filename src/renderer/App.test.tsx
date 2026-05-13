import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const readyStatus = {
  ollamaInstalled: true,
  ollamaRunning: true,
  recommendedModel: "gemma4:e4b" as const,
  selectedModel: "gemma4:e4b" as const,
  version: "0.12.0",
  models: [
    { name: "gemma4:e2b", installed: false },
    { name: "gemma4:e4b", installed: true, size: 9600000000 },
    { name: "gemma4:26b", installed: false }
  ]
};

beforeEach(() => {
  window.localStorage.clear();
  window.os1 = {
    app: {
      info: vi.fn(),
      diagnostics: vi.fn()
    },
    localAi: {
      status: vi.fn().mockResolvedValue(readyStatus),
      startOllama: vi.fn(),
      pullModel: vi.fn(),
      pullModelStream: vi.fn(),
      generateText: vi.fn()
    },
    history: {
      list: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockImplementation(async (c) => c),
      delete: vi.fn(),
      clear: vi.fn()
    }
  };
});

describe("Nur shell", () => {
  it("boots into the main shell when Gemma is already ready", async () => {
    render(<App />);

    // Boot screen shows the brand briefly
    expect(screen.getByRole("heading", { name: "Nur" })).toBeInTheDocument();

    // After the boot animation completes, the Chat heading appears
    await waitFor(() => expect(screen.getByRole("heading", { name: "Спросите Nur" })).toBeInTheDocument(), {
      timeout: 3000
    });
  });

  it("navigates between sections from the sidebar", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Спросите Nur" })).toBeInTheDocument(), {
      timeout: 3000
    });

    await user.click(screen.getByRole("button", { name: "Письма" }));
    expect(screen.getByRole("heading", { name: "Напишите письмо за минуту" })).toBeInTheDocument();
  });

  it("shows the welcome wizard when no model is installed", async () => {
    vi.mocked(window.os1.localAi.status).mockResolvedValue({
      ...readyStatus,
      ollamaInstalled: false,
      ollamaRunning: false,
      models: []
    });
    render(<App />);

    await waitFor(
      () => expect(screen.getByRole("heading", { name: "Сейчас всё подготовлю" })).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });
});
