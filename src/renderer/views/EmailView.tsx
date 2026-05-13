import { FormEvent, ReactElement, useState } from "react";
import { AiOutputPanel } from "../components/AiOutputPanel";
import { SectionFrame } from "../components/SectionFrame";
import { useGemma } from "../hooks/useGemma";

type Tone = "official" | "friendly" | "neutral" | "polite";
type Language = "ru" | "uz" | "en";

const toneLabels: Record<Tone, string> = {
  official: "Официальный",
  polite: "Вежливый",
  neutral: "Нейтральный",
  friendly: "Дружеский"
};

const tonePrompts: Record<Tone, string> = {
  official: "официальный деловой",
  polite: "вежливый и почтительный",
  neutral: "нейтральный профессиональный",
  friendly: "дружеский, но профессиональный"
};

const langLabels: Record<Language, string> = {
  ru: "Русский",
  uz: "Узбекский",
  en: "Английский"
};

const langPrompts: Record<Language, string> = {
  ru: "на русском языке",
  uz: "на узбекском языке (латиница)",
  en: "на английском языке"
};

export function EmailView(): ReactElement {
  const { ready, busy, output, error, run } = useGemma();
  const [recipient, setRecipient] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("polite");
  const [language, setLanguage] = useState<Language>("ru");
  const [context, setContext] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const prompt = [
      `Напиши деловое письмо ${langPrompts[language]}.`,
      `Получатель: ${recipient || "не указан"}.`,
      `Тема: ${topic}.`,
      `Тон: ${tonePrompts[tone]}.`,
      context ? `Дополнительный контекст: ${context}.` : "",
      "Структура: приветствие, основная часть, заключение, подпись.",
      "Не используй markdown. Не пиши никаких пояснений до или после письма — только текст письма."
    ]
      .filter(Boolean)
      .join("\n");
    await run(prompt);
  }

  return (
    <SectionFrame
      eyebrow="Письма"
      title="Напишите письмо за минуту"
      description="Укажите получателя, тему и тон — Nur подготовит готовый черновик. Можно выбрать язык."
    >
      <div className="task-grid">
        <form className="panel-form task-form" onSubmit={handleSubmit}>
          <label>
            <span>Получатель</span>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Например: Иван Петров, руководитель отдела"
            />
          </label>
          <label>
            <span>Тема письма</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Например: перенос встречи на четверг"
              required
            />
          </label>
          <div className="task-form__row">
            <label>
              <span>Тон</span>
              <select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                {(Object.keys(toneLabels) as Tone[]).map((t) => (
                  <option key={t} value={t}>
                    {toneLabels[t]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Язык</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                {(Object.keys(langLabels) as Language[]).map((l) => (
                  <option key={l} value={l}>
                    {langLabels[l]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>Дополнительный контекст (необязательно)</span>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              placeholder="Например: предложить новое время в четверг 15:00 или пятницу 11:00"
            />
          </label>
          <button className="os1-button os1-button--primary" type="submit" disabled={!ready || busy || !topic.trim()}>
            {busy ? "Пишу..." : "Написать письмо"}
          </button>
        </form>

        <AiOutputPanel
          busy={busy}
          ready={ready}
          output={output}
          error={error}
          placeholder="Заполните тему и нажмите «Написать письмо»."
        />
      </div>
    </SectionFrame>
  );
}
