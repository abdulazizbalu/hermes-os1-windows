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
    orgo: {
      credentialStatus: vi.fn().mockResolvedValue({ hasApiKey: false }),
      saveApiKey: vi.fn().mockResolvedValue({ hasApiKey: true }),
      clearApiKey: vi.fn().mockResolvedValue({ hasApiKey: false }),
      listWorkspaces: vi.fn().mockResolvedValue([
        {
          id: "workspace-1",
          name: "Main",
          computers: [{ id: "computer-1", name: "Hermes", status: "running" }]
        }
      ]),
      createComputer: vi.fn().mockResolvedValue({ id: "computer-2", name: "New VM", status: "creating" })
    },
    connections: {
      list: vi.fn().mockResolvedValue([]),
      saveDraft: vi.fn(),
      saveOrgo: vi.fn().mockResolvedValue({
        id: "connection-1",
        label: "Hermes",
        transport: "orgo",
        destination: "Main / Hermes",
        createdAt: "2026-05-13T00:00:00.000Z"
      })
    }
  };
});

describe("ConnectionsView", () => {
  it("saves an Orgo API key and loads workspaces", async () => {
    const user = userEvent.setup();
    render(<ConnectionsView />);

    await user.type(screen.getByLabelText("Orgo API Key"), "sk-live");
    await user.click(screen.getByRole("button", { name: "Verify & Save" }));

    await waitFor(() => expect(window.os1.orgo.saveApiKey).toHaveBeenCalledWith({ apiKey: "sk-live" }));
    expect(await screen.findByText("Main")).toBeInTheDocument();
  });

  it("saves selected workspace and computer as an Orgo connection", async () => {
    const user = userEvent.setup();
    render(<ConnectionsView />);

    await user.click(await screen.findByRole("button", { name: "Load Workspaces" }));
    await user.click(await screen.findByRole("button", { name: "Save Connection" }));

    await waitFor(() =>
      expect(window.os1.connections.saveOrgo).toHaveBeenCalledWith({
        label: "Hermes",
        workspaceId: "workspace-1",
        workspaceName: "Main",
        computerId: "computer-1",
        computerName: "Hermes"
      })
    );
  });
});
