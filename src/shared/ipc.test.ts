import { describe, expect, it } from "vitest";
import {
  assertGenerateLocalTextRequest,
  assertPullLocalModelRequest
} from "./ipc.js";

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

  it("rejects empty prompts", () => {
    expect(() =>
      assertGenerateLocalTextRequest({
        model: "gemma4:e4b",
        prompt: ""
      })
    ).toThrow("Prompt is required.");
  });
});
