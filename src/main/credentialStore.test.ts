import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createEncryptedFileCredentialStore } from "./credentialStore.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "os1-credentials-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("encrypted file credential store", () => {
  it("trims, encrypts, loads, and clears credentials", async () => {
    const store = createEncryptedFileCredentialStore({
      filePath: join(dir, "orgo-key.json"),
      cipher: {
        encryptString: (value) => Buffer.from(`encrypted:${value}`, "utf8"),
        decryptString: (value) => value.toString("utf8").replace("encrypted:", "")
      }
    });

    await store.save(" sk-live ");

    await expect(store.hasValue()).resolves.toBe(true);
    await expect(store.load()).resolves.toBe("sk-live");

    await store.clear();

    await expect(store.hasValue()).resolves.toBe(false);
    await expect(store.load()).resolves.toBeUndefined();
  });

  it("treats empty saves as clear", async () => {
    const store = createEncryptedFileCredentialStore({
      filePath: join(dir, "orgo-key.json"),
      cipher: {
        encryptString: (value) => Buffer.from(value, "utf8"),
        decryptString: (value) => value.toString("utf8")
      }
    });

    await store.save("sk-live");
    await store.save(" ");

    await expect(store.hasValue()).resolves.toBe(false);
  });
});
