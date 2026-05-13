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

  const model: GemmaModelId = status?.selectedModel ?? "gemma4:e4b";
  const ready =
    Boolean(status?.ollamaRunning) &&
    Boolean(status?.models.find((item) => item.name === model)?.installed);

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
