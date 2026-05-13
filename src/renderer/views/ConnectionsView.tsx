import { FormEvent, ReactElement, useEffect, useState } from "react";
import { ConnectionSummary, GemmaModelId, LocalAiStatus, LocalRuntime, gemmaModelIds } from "../../shared/ipc";
import { SectionFrame } from "../components/SectionFrame";
import { StatusPill } from "../components/StatusPill";

const modelLabels: Record<GemmaModelId, string> = {
  "gemma4:e2b": "Gemma 4 E2B",
  "gemma4:e4b": "Gemma 4 E4B",
  "gemma4:26b": "Gemma 4 26B"
};

const modelDescriptions: Record<GemmaModelId, string> = {
  "gemma4:e2b": "Легкий резервный вариант",
  "gemma4:e4b": "Основной выбор Luma",
  "gemma4:26b": "Мощная рабочая станция"
};

export function ConnectionsView(): ReactElement {
  const [connections, setConnections] = useState<ConnectionSummary[]>([]);
  const [localAiStatus, setLocalAiStatus] = useState<LocalAiStatus | undefined>();
  const [selectedModel, setSelectedModel] = useState<GemmaModelId>("gemma4:e4b");
  const [runtime, setRuntime] = useState<LocalRuntime>("windows");
  const [label, setLabel] = useState("Luma Local");
  const [workspacePath, setWorkspacePath] = useState("C:\\Users\\User");
  const [status, setStatus] = useState("Готово.");
  const [russianCheck, setRussianCheck] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void window.os1.connections.list().then(setConnections);
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

  async function saveConnection(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const saved = await window.os1.connections.saveLocal({
      label,
      runtime,
      model: selectedModel,
      workspacePath
    });
    setConnections((current) => [
      saved,
      ...current.filter(
        (connection) =>
          connection.runtime !== saved.runtime ||
          connection.model !== saved.model ||
          connection.workspacePath !== saved.workspacePath
      )
    ]);
    setStatus(`Сохранено: ${saved.label}.`);
  }

  function isModelInstalled(model: GemmaModelId): boolean {
    return localAiStatus ? isModelInstalledInStatus(localAiStatus, model) : false;
  }

  const selectedModelReady = isModelInstalled(selectedModel);
  const ollamaRunning = Boolean(localAiStatus?.ollamaRunning);
  const readinessTone: "muted" | "warning" | "success" = selectedModelReady ? "success" : ollamaRunning ? "warning" : "muted";
  const readinessLabel = selectedModelReady ? "GEMMA ГОТОВА" : ollamaRunning ? "НУЖНА ПОДГОТОВКА" : "OLLAMA ВЫКЛ";
  const readinessTitle = selectedModelReady
    ? "Luma готова отвечать на русском"
    : ollamaRunning
      ? "Подготовим Gemma 4 E4B"
      : "Запустите Ollama, дальше Luma все подхватит";
  const readinessDescription = selectedModelReady
    ? "Модель уже доступна локально. Можно сохранить рабочую папку и переходить к задачам."
    : ollamaRunning
      ? "Ollama найден. Нажмите одну кнопку, чтобы подготовить E4B для локальной работы без ключей."
      : "Luma работает бесплатно через локальную Gemma. Когда Ollama запущен, приложение подготовит E4B автоматически.";

  return (
    <SectionFrame
      eyebrow="Luma Desktop"
      title="Локальная Gemma 4 E4B"
      description="Luma работает бесплатно на локальной Gemma 4 через Ollama, без ключей и без облачного провайдера. Русский язык включен в системный промпт."
    >
      <div className="connections-grid">
        <div className="local-ai-grid">
          <section className="panel-form assistant-setup">
            <div className="assistant-setup__header">
              <div className="assistant-setup__icon" aria-hidden="true">E4B</div>
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
              <button className="os1-button" type="button" onClick={() => void detectOllama()} disabled={isBusy}>
                Проверить Ollama
              </button>
              <button className="os1-button" type="button" onClick={pullModel} disabled={isBusy}>
                Подготовить E4B
              </button>
              <button className="os1-button" type="button" onClick={checkRussian} disabled={isBusy}>
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

          <form className="panel-form workspace-card" onSubmit={saveConnection}>
            <div className="workspace-card__header">
              <h2>Рабочая папка</h2>
              <p>Сохраните место, где Luma будет работать с файлами проекта.</p>
            </div>
            <label htmlFor="local-connection-label">
              <span>Название подключения</span>
              <input id="local-connection-label" value={label} onChange={(event) => setLabel(event.target.value)} />
            </label>
            <label htmlFor="local-runtime">
              <span>Среда</span>
              <select
                id="local-runtime"
                value={runtime}
                onChange={(event) => setRuntime(event.target.value as LocalRuntime)}
              >
                <option value="windows">Windows</option>
                <option value="wsl">WSL</option>
              </select>
            </label>
            <label htmlFor="local-workspace-path">
              <span>Папка workspace</span>
              <input
                id="local-workspace-path"
                aria-label="Папка workspace"
                value={workspacePath}
                onChange={(event) => setWorkspacePath(event.target.value)}
              />
            </label>
            <button className="os1-button" type="submit">
              Сохранить workspace
            </button>
          </form>
        </div>

        <div className="connection-list">
          <div className="connection-list__header">
            <StatusPill tone={connections.length > 0 ? "success" : "muted"}>
              {connections.length > 0 ? "ГОТОВО" : "ПУСТО"}
            </StatusPill>
            <h2>Рабочие пространства</h2>
          </div>
          {connections.length === 0 ? <p className="connection-list__empty">Здесь появится сохраненная локальная Gemma.</p> : null}
          {connections.map((connection) => (
            <article key={connection.id} className="connection-card">
              <h2>{connection.label}</h2>
              <p>{connection.destination}</p>
              <span>{connection.model ?? connection.transport}</span>
            </article>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}

function isModelInstalledInStatus(status: LocalAiStatus, model: GemmaModelId): boolean {
  return status.models.find((item) => item.name === model)?.installed ?? false;
}
