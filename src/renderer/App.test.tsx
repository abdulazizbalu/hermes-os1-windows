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
    localAi: {
      status: vi.fn().mockResolvedValue({
        ollamaInstalled: false,
        ollamaRunning: false,
        recommendedModel: "gemma4:e4b",
        selectedModel: "gemma4:e4b",
        models: []
      }),
      startOllama: vi.fn(),
      pullModel: vi.fn(),
      generateText: vi.fn()
    }
  };
});

describe("Nur shell", () => {
  it("shows boot screen before entering the workspace", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Nur" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Открыть" })).toBeEnabled(), { timeout: 2000 });
  });

  it("enters workspace and opens section routes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Открыть" })).toBeEnabled(), { timeout: 2000 });
    await user.click(screen.getByRole("button", { name: "Открыть" }));
    await user.click(screen.getByRole("button", { name: "Письма" }));

    expect(screen.getByRole("heading", { name: "Письма" })).toBeInTheDocument();
  });
});
