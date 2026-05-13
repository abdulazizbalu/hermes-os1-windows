import { useCallback, useEffect, useState } from "react";
import { GemmaModelId, LocalAiStatus } from "../../shared/ipc";

export interface UseGemmaResult {
  status: LocalAiStatus | undefined;
  model: GemmaModelId;
  ready: boolean;
  busy: boolean;
  output: string;
  error: string;
  run(prompt: string): Promise<void>;
  reset(): void;
}

export function useGemma(): UseGemmaResult {
  const [status, setStatus] = useState<LocalAiStatus | undefined>();
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void window.os1.localAi.status().then(setStatus);
  }, []);

  const installedModel = status?.models.find((m) => m.installed)?.name as GemmaModelId | undefined;
  const model: GemmaModelId = installedModel ?? status?.selectedModel ?? "gemma4:e2b";
  const ready = Boolean(status?.ollamaRunning) && Boolean(installedModel);

  const run = useCallback(
    async (prompt: string): Promise<void> => {
      setError("");
      setOutput("");
      setBusy(true);
      try {
        const response = await window.os1.localAi.generateText({ model, prompt });
        setOutput(response.response.trim());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось получить ответ.");
      } finally {
        setBusy(false);
      }
    },
    [model]
  );

  const reset = useCallback(() => {
    setOutput("");
    setError("");
  }, []);

  return { status, model, ready, busy, output, error, run, reset };
}
