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
      saveOrgo: vi.fn()
    },
    orgo: {
      credentialStatus: vi.fn().mockResolvedValue({ hasApiKey: false }),
      saveApiKey: vi.fn().mockResolvedValue({ hasApiKey: true }),
      clearApiKey: vi.fn().mockResolvedValue({ hasApiKey: false }),
      listWorkspaces: vi.fn().mockResolvedValue([]),
      createComputer: vi.fn()
    }
  };
});

describe("OS1 shell", () => {
  it("shows boot screen before entering the workspace", async () => {
    render(<App />);

    expect(screen.getByText("OS1")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Begin" })).toBeEnabled(), { timeout: 2000 });
  });

  it("enters workspace and opens section routes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Begin" })).toBeEnabled(), { timeout: 2000 });
    await user.click(screen.getByRole("button", { name: "Begin" }));
    await user.click(screen.getByRole("button", { name: "Terminal" }));

    expect(screen.getByRole("heading", { name: "Terminal" })).toBeInTheDocument();
  });
});
