import { describe, expect, it } from "vitest";
import { assertConnectionDraft } from "./ipc.js";

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
