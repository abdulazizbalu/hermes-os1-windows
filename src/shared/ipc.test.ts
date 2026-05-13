import { describe, expect, it } from "vitest";
import {
  assertConnectionDraft,
  assertGenerateLocalTextRequest,
  assertLocalConnectionDraft,
  assertPullLocalModelRequest
} from "./ipc.js";

describe("assertConnectionDraft", () => {
  it("normalizes valid connection drafts", () => {
    expect(
      assertConnectionDraft({
        label: " Local Gemma ",
        transport: "local",
        destination: " Ollama / gemma4:e4b "
      })
    ).toEqual({
      label: "Local Gemma",
      transport: "local",
      destination: "Ollama / gemma4:e4b"
    });
  });

  it("rejects missing labels", () => {
    expect(() =>
      assertConnectionDraft({
        label: "",
        transport: "local",
        destination: "workspace"
      })
    ).toThrow("Connection label is required.");
  });
});

describe("assertLocalConnectionDraft", () => {
  it("normalizes valid local connection drafts", () => {
    expect(
      assertLocalConnectionDraft({
        label: " Gemma Workspace ",
        runtime: " wsl ",
        model: " gemma4:e4b ",
        workspacePath: " C:\\Users\\User "
      })
    ).toEqual({
      label: "Gemma Workspace",
      runtime: "wsl",
      model: "gemma4:e4b",
      workspacePath: "C:\\Users\\User"
    });
  });

  it("rejects unsupported runtimes", () => {
    expect(() =>
      assertLocalConnectionDraft({
        label: "Gemma Workspace",
        runtime: "cloud",
        model: "gemma4:e4b",
        workspacePath: "C:\\Users\\User"
      })
    ).toThrow("Local runtime must be windows or wsl.");
  });
});

describe("assertPullLocalModelRequest", () => {
  it("normalizes supported Gemma model pull requests", () => {
    expect(
      assertPullLocalModelRequest({
        model: " gemma4:26b "
      })
    ).toEqual({
      model: "gemma4:26b"
    });
  });

  it("rejects unsupported local models", () => {
    expect(() => assertPullLocalModelRequest({ model: "llama3.2" })).toThrow(
      "Gemma model must be gemma4:e2b, gemma4:e4b, or gemma4:26b."
    );
  });
});

describe("assertGenerateLocalTextRequest", () => {
  it("normalizes Russian local generation requests", () => {
    expect(
      assertGenerateLocalTextRequest({
        model: " gemma4:e2b ",
        prompt: " Привет, ответь на русском. "
      })
    ).toEqual({
      model: "gemma4:e2b",
      prompt: "Привет, ответь на русском."
    });
  });
});
