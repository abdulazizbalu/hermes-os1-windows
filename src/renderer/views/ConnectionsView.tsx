import { FormEvent, ReactElement, useEffect, useState } from "react";
import { ConnectionSummary, OrgoComputerSummary, OrgoWorkspaceSummary } from "../../shared/ipc";
import { SectionFrame } from "../components/SectionFrame";
import { StatusPill } from "../components/StatusPill";

export function ConnectionsView(): ReactElement {
  const [connections, setConnections] = useState<ConnectionSummary[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [workspaces, setWorkspaces] = useState<OrgoWorkspaceSummary[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedComputerId, setSelectedComputerId] = useState("");
  const [computerName, setComputerName] = useState("Hermes");
  const [connectionName, setConnectionName] = useState("Hermes");
  const [status, setStatus] = useState("Ready.");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void window.os1.connections.list().then(setConnections);
    void window.os1.orgo.credentialStatus().then((credentialStatus) => {
      setHasApiKey(credentialStatus.hasApiKey);
      setStatus(credentialStatus.hasApiKey ? "Orgo key saved." : "Add Orgo API key.");
    });
  }, []);

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
  const selectedComputer = selectedWorkspace?.computers.find((computer) => computer.id === selectedComputerId);

  function selectWorkspace(workspace: OrgoWorkspaceSummary): void {
    const computer = workspace.computers[0];
    setSelectedWorkspaceId(workspace.id);
    setSelectedComputerId(computer?.id ?? "");
    setConnectionName(computer?.name ?? workspace.name);
  }

  function selectComputer(computer: OrgoComputerSummary): void {
    setSelectedComputerId(computer.id);
    setConnectionName(computer.name);
  }

  function applyWorkspaceList(nextWorkspaces: OrgoWorkspaceSummary[]): void {
    setWorkspaces(nextWorkspaces);
    const workspace = nextWorkspaces[0];
    if (!workspace) {
      setSelectedWorkspaceId("");
      setSelectedComputerId("");
      setConnectionName("");
      return;
    }

    selectWorkspace(workspace);
  }

  async function loadWorkspaces(): Promise<void> {
    setIsBusy(true);
    try {
      const nextWorkspaces = await window.os1.orgo.listWorkspaces();
      applyWorkspaceList(nextWorkspaces);
      setStatus(nextWorkspaces.length > 0 ? "Workspaces loaded." : "No Orgo workspaces found.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load Orgo workspaces.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveApiKey(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsBusy(true);
    try {
      const credentialStatus = await window.os1.orgo.saveApiKey({ apiKey });
      setHasApiKey(credentialStatus.hasApiKey);
      setApiKey("");
      setStatus("Orgo key verified.");
      await loadWorkspaces();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not verify Orgo API key.");
    } finally {
      setIsBusy(false);
    }
  }

  async function clearApiKey(): Promise<void> {
    const credentialStatus = await window.os1.orgo.clearApiKey();
    setHasApiKey(credentialStatus.hasApiKey);
    applyWorkspaceList([]);
    setStatus("Orgo key cleared.");
  }

  async function createComputer(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedWorkspace) {
      setStatus("Select a workspace first.");
      return;
    }

    setIsBusy(true);
    try {
      const computer = await window.os1.orgo.createComputer({
        workspaceId: selectedWorkspace.id,
        computerName
      });
      setWorkspaces((current) =>
        current.map((workspace) =>
          workspace.id === selectedWorkspace.id
            ? { ...workspace, computers: [...workspace.computers, computer] }
            : workspace
        )
      );
      setSelectedComputerId(computer.id);
      setConnectionName(computer.name);
      setStatus(`Created ${computer.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create Orgo computer.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveConnection(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedWorkspace || !selectedComputer) {
      setStatus("Select an Orgo computer first.");
      return;
    }

    const label = connectionName.trim() || selectedComputer.name;
    const saved = await window.os1.connections.saveOrgo({
      label,
      workspaceId: selectedWorkspace.id,
      workspaceName: selectedWorkspace.name,
      computerId: selectedComputer.id,
      computerName: selectedComputer.name
    });
    setConnections((current) => [saved, ...current]);
    setStatus(`Saved ${saved.label}.`);
  }

  return (
    <SectionFrame
      eyebrow="Connections"
      title="Connect Orgo"
      description="Set up the OS1 Windows connection layer with encrypted Orgo credentials, workspace discovery, and computer selection."
    >
      <div className="connections-grid">
        <div className="orgo-setup-grid">
          <form className="panel-form" onSubmit={saveApiKey}>
            <label htmlFor="orgo-api-key">
              <span>Orgo API Key</span>
              <input
                id="orgo-api-key"
                aria-label="Orgo API Key"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
            </label>
            <div className="orgo-actions">
              <button className="os1-button" type="submit" disabled={isBusy}>
                Verify & Save
              </button>
              <button className="os1-button" type="button" onClick={clearApiKey} disabled={isBusy}>
                Clear Key
              </button>
              <button className="os1-button" type="button" onClick={loadWorkspaces} disabled={isBusy}>
                Load Workspaces
              </button>
            </div>
            <StatusPill tone={hasApiKey ? "success" : "muted"}>{hasApiKey ? "KEY SAVED" : "NO KEY"}</StatusPill>
            <p>{status}</p>
          </form>

          <div className="workspace-list" aria-label="Workspaces">
            {workspaces.map((workspace) => (
              <button
                className={
                  workspace.id === selectedWorkspaceId ? "workspace-card workspace-card--selected" : "workspace-card"
                }
                key={workspace.id}
                type="button"
                onClick={() => selectWorkspace(workspace)}
              >
                <span>{workspace.name}</span>
                <small>{workspace.computers.length} computers</small>
              </button>
            ))}
          </div>

          {selectedWorkspace ? (
            <div className="computer-list" aria-label="Computers">
              {selectedWorkspace.computers.map((computer) => (
                <button
                  className={
                    computer.id === selectedComputerId ? "computer-row computer-row--selected" : "computer-row"
                  }
                  key={computer.id}
                  type="button"
                  onClick={() => selectComputer(computer)}
                >
                  <span>{computer.name}</span>
                  <small>{computer.status}</small>
                </button>
              ))}
            </div>
          ) : null}

          <form className="panel-form" onSubmit={createComputer}>
            <label htmlFor="orgo-computer-name">
              <span>Computer name</span>
              <input
                id="orgo-computer-name"
                value={computerName}
                onChange={(event) => setComputerName(event.target.value)}
              />
            </label>
            <button className="os1-button" type="submit" disabled={isBusy || !selectedWorkspace}>
              Create Computer
            </button>
          </form>

          <form className="panel-form" onSubmit={saveConnection}>
            <label htmlFor="orgo-connection-name">
              <span>Connection name</span>
              <input
                id="orgo-connection-name"
                value={connectionName}
                onChange={(event) => setConnectionName(event.target.value)}
              />
            </label>
            <button className="os1-button" type="submit" disabled={!selectedWorkspace || !selectedComputer}>
              Save Connection
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
              <span>{connection.transport}</span>
            </article>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}
