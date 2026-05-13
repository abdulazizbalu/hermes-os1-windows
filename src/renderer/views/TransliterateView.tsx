import { ArrowRightLeft, Copy } from "lucide-react";
import { ReactElement, useMemo, useState } from "react";
import { SectionFrame } from "../components/SectionFrame";
import {
  transliterateRuToLat,
  transliterateUzCyrToLat,
  transliterateUzLatToCyr
} from "../utils/transliterate";

type Direction = "ru-to-lat" | "uz-cyr-to-lat" | "uz-lat-to-cyr";

const directions: { id: Direction; label: string; from: string; to: string }[] = [
  { id: "ru-to-lat", label: "Русский → Латиница", from: "Кириллица (русский)", to: "Латиница" },
  { id: "uz-cyr-to-lat", label: "Узбекский: кир. → лат.", from: "Кириллица (ўзбек)", to: "Latin (oʻzbek)" },
  { id: "uz-lat-to-cyr", label: "Узбекский: лат. → кир.", from: "Latin (oʻzbek)", to: "Кириллица (ўзбек)" }
];

export function TransliterateView(): ReactElement {
  const [direction, setDirection] = useState<Direction>("uz-cyr-to-lat");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    switch (direction) {
      case "ru-to-lat":
        return transliterateRuToLat(input);
      case "uz-cyr-to-lat":
        return transliterateUzCyrToLat(input);
      case "uz-lat-to-cyr":
        return transliterateUzLatToCyr(input);
      default:
        return "";
    }
  }, [direction, input]);

  function swapDirection(): void {
    if (direction === "uz-cyr-to-lat") setDirection("uz-lat-to-cyr");
    else if (direction === "uz-lat-to-cyr") setDirection("uz-cyr-to-lat");
  }

  async function copyOutput(): Promise<void> {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  const current = directions.find((d) => d.id === direction) ?? directions[0]!;
  const swappable = direction !== "ru-to-lat";

  return (
    <SectionFrame
      eyebrow="Транслитерация"
      title="Кириллица ↔ латиница"
      description="Мгновенно переведите русский в латиницу или узбекский между двумя алфавитами. Без отправки данных в облако."
    >
      <div className="translit-shell">
        <nav className="converter-tabs" aria-label="Направление транслитерации">
          {directions.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`converter-tab ${direction === d.id ? "converter-tab--selected" : ""}`}
              onClick={() => setDirection(d.id)}
            >
              {d.label}
            </button>
          ))}
        </nav>

        <div className="translit-grid">
          <div className="translit-panel">
            <div className="translit-panel__header">
              <span>{current.from}</span>
            </div>
            <textarea
              className="translit-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              placeholder="Введите или вставьте текст..."
            />
          </div>

          <button
            type="button"
            className="translit-swap"
            onClick={swapDirection}
            disabled={!swappable}
            aria-label="Поменять направление"
            title={swappable ? "Поменять направление" : "Доступно только для узбекского"}
          >
            <ArrowRightLeft size={18} aria-hidden="true" />
          </button>

          <div className="translit-panel">
            <div className="translit-panel__header">
              <span>{current.to}</span>
              {output ? (
                <button type="button" className="ai-output__copy" onClick={copyOutput}>
                  <Copy size={14} aria-hidden="true" />
                  <span>{copied ? "Скопировано" : "Копировать"}</span>
                </button>
              ) : null}
            </div>
            <pre className="translit-output">{output || "—"}</pre>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
