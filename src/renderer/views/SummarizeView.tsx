import { FormEvent, ReactElement, useState } from "react";
import { AiOutputPanel } from "../components/AiOutputPanel";
import { SectionFrame } from "../components/SectionFrame";
import { useGemma } from "../hooks/useGemma";

type Length = "short" | "medium" | "long";
type Style = "paragraph" | "bullets" | "tldr";

const lengthLabels: Record<Length, string> = {
  short: "Кратко (2-3 предложения)",
  medium: "Средне (1 абзац)",
  long: "Подробно (несколько абзацев)"
};

const styleLabels: Record<Style, string> = {
  paragraph: "Абзацем",
  bullets: "Списком ключевых пунктов",
  tldr: "TL;DR + ключевые пункты"
};

export function SummarizeView(): ReactElement {
  const { ready, busy, output, error, run } = useGemma();
  const [source, setSource] = useState("");
  const [length, setLength] = useState<Length>("medium");
  const [style, setStyle] = useState<Style>("tldr");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const prompt = [
      "Сделай краткое содержание следующего текста на русском языке.",
      `Длина: ${lengthLabels[length].toLowerCase()}.`,
      `Формат: ${styleLabels[style].toLowerCase()}.`,
      "Сохрани главные факты, имена, даты и числа. Не добавляй ничего, чего нет в исходном тексте.",
      "",
      "Текст для суммирования:",
      "---",
      source.trim(),
      "---"
    ].join("\n");
    await run(prompt);
  }

  const charCount = source.length;
  const wordCount = source.trim().length === 0 ? 0 : source.trim().split(/\s+/).length;

  return (
    <SectionFrame
      eyebrow="Суммировать"
      title="Краткое содержание длинного текста"
      description="Вставьте статью, отчёт или переписку — Nur выделит главное. Сохранит факты, имена и числа."
    >
      <div className="task-grid">
        <form className="panel-form task-form" onSubmit={handleSubmit}>
          <label>
            <span>Исходный текст</span>
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              rows={14}
              placeholder="Вставьте сюда длинный текст..."
              required
            />
            <small className="task-form__hint">
              {wordCount} слов · {charCount} символов
            </small>
          </label>
          <div className="task-form__row">
            <label>
              <span>Длина</span>
              <select value={length} onChange={(e) => setLength(e.target.value as Length)}>
                {(Object.keys(lengthLabels) as Length[]).map((l) => (
                  <option key={l} value={l}>
                    {lengthLabels[l]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Формат</span>
              <select value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                {(Object.keys(styleLabels) as Style[]).map((s) => (
                  <option key={s} value={s}>
                    {styleLabels[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="os1-button os1-button--primary" type="submit" disabled={!ready || busy || !source.trim()}>
            {busy ? "Анализирую..." : "Суммировать"}
          </button>
        </form>

        <AiOutputPanel
          busy={busy}
          ready={ready}
          output={output}
          error={error}
          placeholder="Вставьте текст и нажмите «Суммировать»."
        />
      </div>
    </SectionFrame>
  );
}
