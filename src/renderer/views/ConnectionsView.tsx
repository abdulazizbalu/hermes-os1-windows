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
  "gemma4:e2b": "Light local model",
  "gemma4:e4b": "Recommended local model",
  "gemma4:26b": "Workstation model"
};

export function ConnectionsView(): ReactElement {
  const [connections, setConnections] = useState<ConnectionSummary[]>([]);
  const [localAiStatus, setLocalAiStatus] = useState<LocalAiStatus | undefined>();
  const [selectedModel, setSelectedModel] = useState<GemmaModelId>("gemma4:e4b");
  const [runtime, setRuntime] = useState<LocalRuntime>("windows");
  const [label, setLabel] = useState("Local Gemma");
  const [workspacePath, setWorkspacePath] = useState("C:\\Users\\User");
  const [status, setStatus] = useState("Ready.");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void window.os1.connections.list().then(setConnections);
    void detectOllama();
  }, []);

  async function detectOllama(): Promise<void> {
    setIsBusy(true);
    try {
      const nextStatus = await window.os1.localAi.status();
      setLocalAiStatus(nextStatus);
      setSelectedModel(nextStatus.selectedModel);
      setStatus(nextStatus.ollamaRunning ? "Ollama ready." : nextStatus.error ?? "Ollama not running.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not detect Ollama.");
    } finally {
      setIsBusy(false);
    }
  }

  async function pullModel(): Promise<void> {
    setIsBusy(true);
    try {
      const nextStatus = await window.os1.localAi.pullModel({ model: selectedModel });
      setLocalAiStatus(nextStatus);
      setStatus(`${modelLabels[selectedModel]} installed.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not pull Gemma 4.");
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
    setConnections((current) => [saved, ...current]);
    setStatus(`Saved ${saved.label}.`);
  }

  function isModelInstalled(model: GemmaModelId): boolean {
    return localAiStatus?.models.find((item) => item.name === model)?.installed ?? false;
  }

  return (
    <SectionFrame
      eyebrow="Connections"
      title="Local Gemma"
      description="Run OS1 against a free local Gemma 4 model through Ollama instead of a cloud computer provider."
    >
      <div className="connections-grid">
        <div className="local-ai-grid">
          <section className="panel-form">
            <div className="local-ai-status">
              <StatusPill tone={localAiStatus?.ollamaRunning ? "success" : "warning"}>
                {localAiStatus?.ollamaRunning ? "OLLAMA READY" : "OLLAMA OFF"}
              </StatusPill>
              {localAiStatus?.version ? <span>Ollama {localAiStatus.version}</span> : <span>Ollama not detected</span>}
            </div>
            <div className="local-actions">
              <button className="os1-button" type="button" onClick={detectOllama} disabled={isBusy}>
                Detect Ollama
              </button>
              <button className="os1-button" type="button" onClick={pullModel} disabled={isBusy}>
                Pull Gemma 4
              </button>
            </div>
            <p>{status}</p>
          </section>

          <div className="model-grid" aria-label="Gemma models">
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
                  {isModelInstalled(model) ? "INSTALLED" : "LOCAL"}
                </StatusPill>
              </button>
            ))}
          </div>

          <form className="panel-form" onSubmit={saveConnection}>
            <label htmlFor="local-connection-label">
              <span>Connection name</span>
              <input id="local-connection-label" value={label} onChange={(event) => setLabel(event.target.value)} />
            </label>
            <label htmlFor="local-runtime">
              <span>Runtime</span>
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
              <span>Workspace path</span>
              <input
                id="local-workspace-path"
                aria-label="Workspace path"
                value={workspacePath}
                onChange={(event) => setWorkspacePath(event.target.value)}
              />
            </label>
            <button className="os1-button" type="submit" disabled={isBusy}>
              Save Local Workspace
            </button>
          </form>
        </div>

        <div className="connection-list">
          <StatusPill tone={connections.length > 0 ? "success" : "muted"}>
            {connections.length > 0 ? "CONNECTIONS" : "NO HOSTS"}
          </StatusPill>
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
