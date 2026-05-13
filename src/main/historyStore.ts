import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { HistoryConversation } from "../shared/ipc.js";
import { getNurAppPaths } from "./appPaths.js";

const MAX_CONVERSATIONS = 200;

export async function readHistory(): Promise<HistoryConversation[]> {
  const paths = getNurAppPaths();
  try {
    const raw = await readFile(paths.history, "utf8");
    const parsed = JSON.parse(raw) as HistoryConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeHistory(conversations: HistoryConversation[]): Promise<void> {
  const paths = getNurAppPaths();
  await mkdir(dirname(paths.history), { recursive: true });
  const trimmed = conversations.slice(0, MAX_CONVERSATIONS);
  await writeFile(paths.history, JSON.stringify(trimmed, null, 2), "utf8");
}

export async function upsertConversation(conversation: HistoryConversation): Promise<HistoryConversation> {
  const all = await readHistory();
  const filtered = all.filter((c) => c.id !== conversation.id);
  await writeHistory([conversation, ...filtered]);
  return conversation;
}

export async function deleteConversation(id: string): Promise<void> {
  const all = await readHistory();
  await writeHistory(all.filter((c) => c.id !== id));
}

export async function clearHistory(): Promise<void> {
  await writeHistory([]);
}
