import { FormEvent, ReactElement, useState } from "react";
import { AiOutputPanel } from "../components/AiOutputPanel";
import { SectionFrame } from "../components/SectionFrame";
import { useGemma } from "../hooks/useGemma";

type Mode = "grammar" | "shorter" | "longer" | "formal" | "friendly" | "simple" | "rewrite";

const modeLabels: Record<Mode, string> = {
  grammar: "Исправить грамматику",
  shorter: "Сделать короче",
  longer: "Расширить",
  formal: "Сделать формальнее",
  friendly: "Сделать дружелюбнее",
  simple: "Упростить язык",
  rewrite: "Переписать иначе"
};

const modePrompts: Record<Mode, string> = {
  grammar:
    "Исправь все грамматические и орфографические ошибки. Сохрани смысл, стиль и тон. Не переписывай предложения без необходимости.",
  shorter: "Сделай текст значительно короче, сохранив все ключевые идеи. Убери воду и повторы.",
  longer: "Расширь текст, добавив больше деталей, примеров и пояснений. Сохрани смысл.",
  formal: "Перепиши текст в более формальном, деловом стиле. Подходит для официальной переписки.",
  friendly: "Перепиши текст в более дружелюбном и тёплом тоне, оставаясь профессиональным.",
  simple: "Перепиши текст простым и понятным языком. Убери сложные слова и канцеляризмы.",
  rewrite: "Перепиши текст другими словами, сохранив смысл. Используй другую структуру предложений."
};

export function ImproveView(): ReactElement {
  const { ready, busy, output, error, run } = useGemma();
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<Mode>("grammar");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const prompt = [
      modePrompts[mode],
      "В ответе выведи ТОЛЬКО улучшенный текст, без пояснений и комментариев.",
      "",
      "Исходный текст:",
      "---",
      source.trim(),
      "---"
    ].join("\n");
    await run(prompt);
  }

  return (
    <SectionFrame
      eyebrow="Улучшить"
      title="Доведите текст до ума"
      description="Грамматика, тон, длина, стиль — Nur перепишет текст под выбранную задачу."
    >
      <div className="task-grid">
        <form className="panel-form task-form" onSubmit={handleSubmit}>
          <div className="improve-modes">
            {(Object.keys(modeLabels) as Mode[]).map((m) => (
              <button
                type="button"
                key={m}
                className={`improve-mode ${mode === m ? "improve-mode--selected" : ""}`}
                onClick={() => setMode(m)}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>
          <label>
            <span>Исходный текст</span>
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              rows={12}
              placeholder="Вставьте текст, который нужно улучшить..."
              required
            />
          </label>
          <button className="os1-button os1-button--primary" type="submit" disabled={!ready || busy || !source.trim()}>
            {busy ? "Улучшаю..." : modeLabels[mode]}
          </button>
        </form>

        <AiOutputPanel
          busy={busy}
          ready={ready}
          output={output}
          error={error}
          placeholder="Выберите режим, вставьте текст и нажмите кнопку."
        />
      </div>
    </SectionFrame>
  );
}
