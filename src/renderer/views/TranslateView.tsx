import { ArrowRightLeft } from "lucide-react";
import { FormEvent, ReactElement, useState } from "react";
import { AiOutputPanel } from "../components/AiOutputPanel";
import { SectionFrame } from "../components/SectionFrame";
import { useGemma } from "../hooks/useGemma";

type Language = "ru" | "uz-lat" | "uz-cyr" | "en";

const langLabels: Record<Language, string> = {
  ru: "Русский",
  "uz-lat": "Узбекский (латиница)",
  "uz-cyr": "Узбекский (кириллица)",
  en: "Английский"
};

const langPrompts: Record<Language, string> = {
  ru: "русский язык",
  "uz-lat": "узбекский язык с использованием латиницы (oʻzbek tili, lotin alifbosi)",
  "uz-cyr": "узбекский язык с использованием кириллицы (ўзбек тили, кирилл алифбоси)",
  en: "английский язык"
};

export function TranslateView(): ReactElement {
  const { ready, busy, output, error, run } = useGemma();
  const [source, setSource] = useState("");
  const [from, setFrom] = useState<Language>("ru");
  const [to, setTo] = useState<Language>("uz-lat");

  function swapLanguages(): void {
    setFrom(to);
    setTo(from);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const prompt = [
      `Переведи следующий текст с языка "${langPrompts[from]}" на язык "${langPrompts[to]}".`,
      "Сохрани смысл, тон и стиль исходного текста. Не добавляй комментариев.",
      "В ответе выведи ТОЛЬКО переведённый текст, без пояснений.",
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
      eyebrow="Перевести"
      title="Перевод между языками"
      description="Русский, узбекский (латиница и кириллица), английский. Перевод сохранит тон и стиль."
    >
      <div className="task-grid">
        <form className="panel-form task-form" onSubmit={handleSubmit}>
          <div className="translate-langs">
            <label>
              <span>С языка</span>
              <select value={from} onChange={(e) => setFrom(e.target.value as Language)}>
                {(Object.keys(langLabels) as Language[]).map((l) => (
                  <option key={l} value={l}>
                    {langLabels[l]}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="translate-swap" onClick={swapLanguages} aria-label="Поменять языки">
              <ArrowRightLeft size={16} aria-hidden="true" />
            </button>
            <label>
              <span>На язык</span>
              <select value={to} onChange={(e) => setTo(e.target.value as Language)}>
                {(Object.keys(langLabels) as Language[]).map((l) => (
                  <option key={l} value={l}>
                    {langLabels[l]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>Текст</span>
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              rows={10}
              placeholder="Вставьте текст для перевода..."
              required
            />
          </label>
          <button className="os1-button os1-button--primary" type="submit" disabled={!ready || busy || !source.trim() || from === to}>
            {busy ? "Перевожу..." : "Перевести"}
          </button>
        </form>

        <AiOutputPanel
          busy={busy}
          ready={ready}
          output={output}
          error={error}
          placeholder="Введите текст и нажмите «Перевести»."
        />
      </div>
    </SectionFrame>
  );
}
