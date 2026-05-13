import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

beforeEach(() => {
  window.os1 = {
    app: {
      info: vi.fn(),
      diagnostics: vi.fn()
    },
    connections: {
      list: vi.fn().mockResolvedValue([]),
      saveDraft: vi.fn().mockImplementation(async (draft) => ({
        ...draft,
        id: "connection-1",
        createdAt: "2026-05-12T00:00:00.000Z"
      })),
      saveLocal: vi.fn()
    },
    localAi: {
      status: vi.fn().mockResolvedValue({
        ollamaInstalled: false,
        ollamaRunning: false,
        recommendedModel: "gemma4:e4b",
        selectedModel: "gemma4:e4b",
        models: []
      }),
      pullModel: vi.fn(),
      generateText: vi.fn()
    }
  };
});

describe("Luma shell", () => {
  it("shows boot screen before entering the workspace", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Luma" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Открыть" })).toBeEnabled(), { timeout: 2000 });
  });

  it("enters workspace and opens section routes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Открыть" })).toBeEnabled(), { timeout: 2000 });
    await user.click(screen.getByRole("button", { name: "Открыть" }));
    await user.click(screen.getByRole("button", { name: "Терминал" }));

    expect(screen.getByRole("heading", { name: "Терминал" })).toBeInTheDocument();
  });
});
