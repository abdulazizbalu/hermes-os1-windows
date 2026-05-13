import { Copy } from "lucide-react";
import { ReactElement, useState } from "react";
import { StatusPill } from "./StatusPill";

interface AiOutputPanelProps {
  busy: boolean;
  ready: boolean;
  output: string;
  error: string;
  placeholder?: string;
  notReadyMessage?: string;
}

export function AiOutputPanel({
  busy,
  ready,
  output,
  error,
  placeholder = "Здесь появится результат от Nur.",
  notReadyMessage = "Подготовьте Gemma в разделе «Настройки»."
}: AiOutputPanelProps): ReactElement {
  const [copied, setCopied] = useState(false);

  async function copyOutput(): Promise<void> {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard API can fail in some Electron contexts
    }
  }

  const hasResult = output.length > 0;

  return (
    <section className="ai-output">
      <header className="ai-output__header">
        <h3>Результат</h3>
        {hasResult ? (
          <button type="button" className="ai-output__copy" onClick={copyOutput} aria-label="Скопировать">
            <Copy size={14} aria-hidden="true" />
            <span>{copied ? "Скопировано" : "Копировать"}</span>
          </button>
        ) : null}
      </header>
      <div className="ai-output__body">
        {!ready ? (
          <p className="ai-output__hint">{notReadyMessage}</p>
        ) : busy ? (
          <p className="ai-output__hint">
            <StatusPill tone="muted">ДУМАЮ</StatusPill>
          </p>
        ) : error ? (
          <p className="ai-output__error">⚠ {error}</p>
        ) : hasResult ? (
          <pre className="ai-output__text">{output}</pre>
        ) : (
          <p className="ai-output__hint">{placeholder}</p>
        )}
      </div>
    </section>
  );
}
