import { describe, expect, it } from "vitest";
import { assertConnectionDraft, assertCreateOrgoComputerRequest, assertOrgoConnectionDraft } from "./ipc.js";

describe("assertConnectionDraft", () => {
  it("normalizes valid connection drafts", () => {
    expect(
      assertConnectionDraft({
        label: " Orgo VM ",
        transport: "orgo",
        destination: " workspace "
      })
    ).toEqual({
      label: "Orgo VM",
      transport: "orgo",
      destination: "workspace"
    });
  });

  it("rejects missing labels", () => {
    expect(() =>
      assertConnectionDraft({
        label: "",
        transport: "orgo",
        destination: "workspace"
      })
    ).toThrow("Connection label is required.");
  });
});

describe("assertOrgoConnectionDraft", () => {
  it("normalizes valid Orgo connection drafts", () => {
    expect(
      assertOrgoConnectionDraft({
        label: " OS1 VM ",
        workspaceId: " workspace-1 ",
        workspaceName: " Main ",
        computerId: " computer-1 ",
        computerName: " Hermes "
      })
    ).toEqual({
      label: "OS1 VM",
      workspaceId: "workspace-1",
      workspaceName: "Main",
      computerId: "computer-1",
      computerName: "Hermes"
    });
  });

  it("rejects missing workspace and computer ids", () => {
    expect(() =>
      assertOrgoConnectionDraft({
        label: "OS1 VM",
        workspaceId: "",
        workspaceName: "Main",
        computerId: "",
        computerName: "Hermes"
      })
    ).toThrow("Orgo workspace is required.");
  });
});

describe("assertCreateOrgoComputerRequest", () => {
  it("normalizes computer creation requests", () => {
    expect(
      assertCreateOrgoComputerRequest({
        workspaceId: " workspace-1 ",
        computerName: " My Computer "
      })
    ).toEqual({
      workspaceId: "workspace-1",
      computerName: "My Computer"
    });
  });
});
