import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface CredentialCipher {
  encryptString(value: string): Buffer;
  decryptString(value: Buffer): string;
}

export interface CredentialStore {
  hasValue(): Promise<boolean>;
  load(): Promise<string | undefined>;
  save(value: string): Promise<void>;
  clear(): Promise<void>;
}

interface StoreOptions {
  filePath: string;
  cipher: CredentialCipher;
}

export function createEncryptedFileCredentialStore({ filePath, cipher }: StoreOptions): CredentialStore {
  return {
    async hasValue(): Promise<boolean> {
      return (await this.load()) !== undefined;
    },

    async load(): Promise<string | undefined> {
      try {
        const raw = JSON.parse(await readFile(filePath, "utf8")) as { value?: string };
        if (!raw.value) {
          return undefined;
        }

        const decrypted = cipher.decryptString(Buffer.from(raw.value, "base64")).trim();
        return decrypted || undefined;
      } catch {
        return undefined;
      }
    },

    async save(value: string): Promise<void> {
      const trimmed = value.trim();
      if (!trimmed) {
        await this.clear();
        return;
      }

      await mkdir(dirname(filePath), { recursive: true });
      const encrypted = cipher.encryptString(trimmed).toString("base64");
      await writeFile(filePath, JSON.stringify({ value: encrypted }, null, 2), "utf8");
    },

    async clear(): Promise<void> {
      await rm(filePath, { force: true });
    }
  };
}
