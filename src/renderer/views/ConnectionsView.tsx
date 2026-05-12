import { FormEvent, ReactElement, useEffect, useState } from "react";
import { ConnectionSummary } from "../../shared/ipc";
import { SectionFrame } from "../components/SectionFrame";
import { StatusPill } from "../components/StatusPill";

export function ConnectionsView(): ReactElement {
  const [connections, setConnections] = useState<ConnectionSummary[]>([]);
  const [label, setLabel] = useState("Orgo VM");
  const [destination, setDestination] = useState("orgo workspace");
  const [status, setStatus] = useState("Ready for Orgo parity implementation.");

  useEffect(() => {
    void window.os1.connections.list().then(setConnections);
  }, []);

  async function saveDraft(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const saved = await window.os1.connections.saveDraft({
      label,
      destination,
      transport: "orgo"
    });
    setConnections((current) => [saved, ...current]);
    setStatus(`Saved ${saved.label}.`);
  }

  return (
    <SectionFrame
      eyebrow="Connections"
      title="Connect the workspace"
      description="The first parity milestone wires the OS1 shell and safe IPC. The next milestone turns this draft surface into real Orgo key verification, workspace selection, and computer creation."
    >
      <div className="connections-grid">
        <form className="panel-form" onSubmit={saveDraft}>
          <label>
            <span>Label</span>
            <input value={label} onChange={(event) => setLabel(event.target.value)} />
          </label>
          <label>
            <span>Destination</span>
            <input value={destination} onChange={(event) => setDestination(event.target.value)} />
          </label>
          <button className="os1-button" type="submit">Save Draft</button>
          <p>{status}</p>
        </form>
        <div className="connection-list">
          <StatusPill tone={connections.length > 0 ? "success" : "muted"}>
            {connections.length > 0 ? "DRAFTS SAVED" : "NO HOSTS"}
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
