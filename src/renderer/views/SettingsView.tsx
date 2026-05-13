import { ReactElement, useEffect, useState } from "react";
import { GemmaModelId, LocalAiStatus, gemmaModelIds } from "../../shared/ipc";
import { SectionFrame } from "../components/SectionFrame";
import { StatusPill } from "../components/StatusPill";

const modelLabels: Record<GemmaModelId, string> = {
  "gemma4:e2b": "Gemma 4 E2B",
  "gemma4:e4b": "Gemma 4 E4B",
  "gemma4:26b": "Gemma 4 26B"
};

const modelDescriptions: Record<GemmaModelId, string> = {
  "gemma4:e2b": "Лёгкая, для слабого железа",
  "gemma4:e4b": "Рекомендуем для Nur",
  "gemma4:26b": "Максимальное качество"
};

export function SettingsView(): ReactElement {
  const [localAiStatus, setLocalAiStatus] = useState<LocalAiStatus | undefined>();
  const [selectedModel, setSelectedModel] = useState<GemmaModelId>("gemma4:e4b");
  const [status, setStatus] = useState("Готово.");
  const [russianCheck, setRussianCheck] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void detectOllama(true);
  }, []);

  async function detectOllama(autoPrepare = false): Promise<void> {
    setIsBusy(true);
    try {
      const nextStatus = await window.os1.localAi.status();
      setLocalAiStatus(nextStatus);
      setSelectedModel(nextStatus.selectedModel);
      if (autoPrepare && nextStatus.ollamaRunning && !isModelInstalledInStatus(nextStatus, nextStatus.selectedModel)) {
        setStatus(`${modelLabels[nextStatus.selectedModel]} подготавливается...`);
        const preparedStatus = await window.os1.localAi.pullModel({ model: nextStatus.selectedModel });
        setLocalAiStatus(preparedStatus);
        setStatus(`${modelLabels[nextStatus.selectedModel]} готова.`);
        return;
      }
      setStatus(nextStatus.ollamaRunning ? "Ollama готов." : nextStatus.error ?? "Ollama не запущен.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось проверить Ollama.");
    } finally {
      setIsBusy(false);
    }
  }

  async function startOllama(): Promise<void> {
    setIsBusy(true);
    setStatus("Запускаю Ollama...");
    try {
      const nextStatus = await window.os1.localAi.startOllama();
      setLocalAiStatus(nextStatus);
      setSelectedModel(nextStatus.selectedModel);
      setStatus(nextStatus.ollamaRunning ? "Ollama запущен. Можно подготовить Gemma." : nextStatus.error ?? "Ollama пока не отвечает.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось запустить Ollama.");
    } finally {
      setIsBusy(false);
    }
  }

  function downloadOllama(): void {
    window.open("https://ollama.com/download/windows", "_blank", "noopener,noreferrer");
  }

  async function pullModel(): Promise<void> {
    setIsBusy(true);
    try {
      const nextStatus = await window.os1.localAi.pullModel({ model: selectedModel });
      setLocalAiStatus(nextStatus);
      setStatus(`${modelLabels[selectedModel]} готова.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось скачать Gemma 4.");
    } finally {
      setIsBusy(false);
    }
  }

  async function checkRussian(): Promise<void> {
    setIsBusy(true);
    try {
      const result = await window.os1.localAi.generateText({
        model: selectedModel,
        prompt: "Скажи по-русски, что Gemma 4 готова к работе."
      });
      setRussianCheck(result.response);
      setStatus("Русский ответ получен.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось проверить русский язык.");
    } finally {
      setIsBusy(false);
    }
  }

  function isModelInstalled(model: GemmaModelId): boolean {
    return localAiStatus ? isModelInstalledInStatus(localAiStatus, model) : false;
  }

  const selectedModelReady = isModelInstalled(selectedModel);
  const ollamaRunning = Boolean(localAiStatus?.ollamaRunning);
  const ollamaInstalled = Boolean(localAiStatus?.ollamaInstalled);
  const readinessTone: "muted" | "warning" | "success" = selectedModelReady ? "success" : ollamaRunning ? "warning" : "muted";
  const readinessLabel = selectedModelReady
    ? "GEMMA ГОТОВА"
    : ollamaRunning
      ? "НУЖНА ПОДГОТОВКА"
      : ollamaInstalled
        ? "OLLAMA ОСТАНОВЛЕН"
        : "НУЖЕН OLLAMA";
  const readinessTitle = selectedModelReady
    ? "Nur готов к работе"
    : ollamaRunning
      ? "Подготовим Gemma 4"
      : ollamaInstalled
        ? "Запустите Ollama прямо отсюда"
        : "Установите Ollama, дальше Nur всё подхватит";
  const readinessDescription = selectedModelReady
    ? "Модель доступна локально. Можно переходить к задачам."
    : ollamaRunning
      ? "Ollama найден. Нажмите одну кнопку, чтобы подготовить Gemma 4 для локальной работы без ключей."
      : ollamaInstalled
        ? "Nur попробует поднять локальный сервер Ollama и затем подготовит Gemma 4."
        : "Ollama нужен один раз как локальный движок. После установки Nur подготовит Gemma 4 без API-ключей.";

  return (
    <SectionFrame
      eyebrow="Настройки"
      title="Локальная Gemma 4"
      description="Nur работает бесплатно на локальной Gemma 4 через Ollama, без ключей и без облака. Русский язык включён в системный промпт."
    >
      <div className="connections-grid">
        <div className="local-ai-grid">
          <section className="panel-form assistant-setup">
            <div className="assistant-setup__header">
              <div className="assistant-setup__icon" aria-hidden="true">Nur</div>
              <div>
                <StatusPill tone={readinessTone}>{readinessLabel}</StatusPill>
                <h2>{readinessTitle}</h2>
                <p>{readinessDescription}</p>
              </div>
            </div>
            <div className="local-ai-status">
              <StatusPill tone={localAiStatus?.ollamaRunning ? "success" : "warning"}>
                {localAiStatus?.ollamaRunning ? "OLLAMA ГОТОВ" : "OLLAMA ВЫКЛ"}
              </StatusPill>
              {localAiStatus?.version ? <span>Ollama {localAiStatus.version}</span> : <span>Ollama не найден</span>}
            </div>
            <div className="local-actions">
              {!ollamaInstalled ? (
                <button className="os1-button os1-button--primary" type="button" onClick={downloadOllama} disabled={isBusy}>
                  Скачать Ollama
                </button>
              ) : null}
              {ollamaInstalled && !ollamaRunning ? (
                <button className="os1-button os1-button--primary" type="button" onClick={startOllama} disabled={isBusy}>
                  Запустить Ollama
                </button>
              ) : null}
              <button className="os1-button" type="button" onClick={() => void detectOllama()} disabled={isBusy}>
                Проверить Ollama
              </button>
              <button className="os1-button" type="button" onClick={pullModel} disabled={isBusy || !ollamaRunning}>
                Подготовить Gemma
              </button>
              <button className="os1-button" type="button" onClick={checkRussian} disabled={isBusy || !selectedModelReady}>
                Проверить русский
              </button>
            </div>
            <p>{status}</p>
            {russianCheck ? <p className="russian-check">{russianCheck}</p> : null}
          </section>

          <div className="model-grid" aria-label="Модели Gemma">
            {gemmaModelIds.map((model) => (
              <button
                className={model === selectedModel ? "model-card model-card--selected" : "model-card"}
                key={model}
                type="button"
                onClick={() => setSelectedModel(model)}
              >
                <span>{modelLabels[model]}</span>
                <small>{modelDescriptions[model]}</small>
                <StatusPill tone={isModelInstalled(model) ? "success" : "muted"}>
                  {isModelInstalled(model) ? "ГОТОВА" : "ПОДГОТОВИТЬ"}
                </StatusPill>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

function isModelInstalledInStatus(status: LocalAiStatus, model: GemmaModelId): boolean {
  return status.models.find((item) => item.name === model)?.installed ?? false;
}
