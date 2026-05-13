import { FormEvent, ReactElement, useEffect, useRef, useState } from "react";
import { GemmaModelId, LocalAiStatus } from "../../shared/ipc";
import { SectionFrame } from "../components/SectionFrame";
import { StatusPill } from "../components/StatusPill";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

export function ChatView(): ReactElement {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [localAiStatus, setLocalAiStatus] = useState<LocalAiStatus | undefined>();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void window.os1.localAi.status().then(setLocalAiStatus);
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  const selectedModel: GemmaModelId = localAiStatus?.selectedModel ?? "gemma4:e4b";
  const modelReady =
    localAiStatus?.models.find((item) => item.name === selectedModel)?.installed ?? false;
  const canSend = Boolean(localAiStatus?.ollamaRunning && modelReady && !isSending);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !canSend) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text
    };
    const assistantId = crypto.randomUUID();
    const pendingAssistant: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      pending: true
    };

    setMessages((prev) => [...prev, userMessage, pendingAssistant]);
    setDraft("");
    setIsSending(true);

    try {
      const response = await window.os1.localAi.generateText({
        model: selectedModel,
        prompt: text
      });
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? { ...message, content: response.response.trim(), pending: false }
            : message
        )
      );
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Не удалось получить ответ.";
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? { ...message, content: `⚠ ${errorText}`, pending: false }
            : message
        )
      );
    } finally {
      setIsSending(false);
    }
  }

  const readinessLabel = !localAiStatus
    ? "ПРОВЕРКА"
    : !localAiStatus.ollamaRunning
      ? "OLLAMA ВЫКЛ"
      : !modelReady
        ? "GEMMA НЕ ГОТОВА"
        : "ГОТОВ К РАБОТЕ";
  const readinessTone: "muted" | "warning" | "success" =
    !localAiStatus?.ollamaRunning ? "muted" : !modelReady ? "warning" : "success";

  return (
    <SectionFrame
      eyebrow="Чат"
      title="Спросите Nur"
      description="Свободный диалог с локальной Gemma 4. Всё работает на вашем компьютере, без облака."
    >
      <div className="chat-shell">
        <div className="chat-status">
          <StatusPill tone={readinessTone}>{readinessLabel}</StatusPill>
          {!canSend && localAiStatus ? (
            <span>
              {!localAiStatus.ollamaRunning
                ? "Запустите Ollama в разделе «Настройки»."
                : !modelReady
                  ? "Подготовьте модель в разделе «Настройки»."
                  : ""}
            </span>
          ) : null}
        </div>

        <div className="chat-messages" ref={scrollerRef} aria-live="polite">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <h2>С чего начнём?</h2>
              <p>Задайте вопрос, попросите написать письмо, перевести текст или объяснить тему. Nur ответит на русском.</p>
              <div className="chat-suggestions">
                <button type="button" className="chat-suggestion" onClick={() => setDraft("Напиши короткое деловое письмо коллеге с просьбой перенести встречу на завтра.")}>
                  Написать письмо
                </button>
                <button type="button" className="chat-suggestion" onClick={() => setDraft("Объясни простыми словами, что такое разница между HTTP и HTTPS.")}>
                  Объяснить тему
                </button>
                <button type="button" className="chat-suggestion" onClick={() => setDraft("Переведи на узбекский: «Спасибо за оперативный ответ, жду вашего решения».")}>
                  Перевести
                </button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`chat-message chat-message--${message.role}`}>
                <div className="chat-message__bubble">
                  {message.pending ? <span className="chat-typing" aria-label="Nur печатает">●●●</span> : message.content}
                </div>
              </div>
            ))
          )}
        </div>

        <form className="chat-composer" onSubmit={handleSubmit}>
          <textarea
            className="chat-input"
            placeholder={canSend ? "Напишите сообщение..." : "Подготовьте Gemma в разделе «Настройки»"}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                (event.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
            rows={3}
            disabled={!canSend}
          />
          <button className="os1-button os1-button--primary chat-send" type="submit" disabled={!canSend || draft.trim().length === 0}>
            {isSending ? "Думаю..." : "Отправить"}
          </button>
        </form>
      </div>
    </SectionFrame>
  );
}
