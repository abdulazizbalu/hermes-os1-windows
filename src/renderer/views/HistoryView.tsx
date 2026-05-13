import { Trash2 } from "lucide-react";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { HistoryConversation } from "../../shared/ipc";
import { SectionFrame } from "../components/SectionFrame";
import { StatusPill } from "../components/StatusPill";

export function HistoryView(): ReactElement {
  const [conversations, setConversations] = useState<HistoryConversation[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const list = await window.os1.history.list();
      setConversations(list);
      setActiveId(list[0]?.id);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    await window.os1.history.delete(id);
    await refresh();
  }

  async function handleClearAll(): Promise<void> {
    if (!confirm("Удалить всю историю? Это действие нельзя отменить.")) return;
    await window.os1.history.clear();
    await refresh();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true;
      return c.messages.some((m) => m.content.toLowerCase().includes(q));
    });
  }, [conversations, query]);

  const active = filtered.find((c) => c.id === activeId) ?? filtered[0];

  return (
    <SectionFrame
      eyebrow="История"
      title="Прошлые разговоры"
      description="Все ваши чаты с Nur сохраняются локально. Найдите старый ответ или продолжите разговор."
    >
      <div className="history-shell">
        <aside className="history-list">
          <div className="history-list__toolbar">
            <input
              type="search"
              placeholder="Поиск по разговорам..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {conversations.length > 0 ? (
              <button type="button" className="history-clear" onClick={handleClearAll} aria-label="Очистить всю историю">
                <Trash2 size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <div className="history-list__items os1-scroll">
            {loading ? (
              <p className="history-empty">Загрузка...</p>
            ) : filtered.length === 0 ? (
              <p className="history-empty">
                {conversations.length === 0
                  ? "История пуста. Начните разговор в разделе «Чат»."
                  : "Ничего не найдено."}
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`history-item ${c.id === active?.id ? "history-item--selected" : ""}`}
                  onClick={() => setActiveId(c.id)}
                >
                  <div className="history-item__title">{c.title}</div>
                  <div className="history-item__meta">
                    <span>{new Date(c.updatedAt).toLocaleString("ru-RU")}</span>
                    <StatusPill tone="muted">{`${c.messages.length} сообщ.`}</StatusPill>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="history-detail">
          {active ? (
            <>
              <header className="history-detail__header">
                <h2>{active.title}</h2>
                <button
                  type="button"
                  className="os1-button history-detail__delete"
                  onClick={() => void handleDelete(active.id)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Удалить
                </button>
              </header>
              <div className="history-detail__body os1-scroll">
                {active.messages.map((m, i) => (
                  <div key={i} className={`chat-message chat-message--${m.role}`}>
                    <div className="chat-message__bubble">{m.content}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="history-detail__empty">
              <p>Выберите разговор слева, чтобы посмотреть содержимое.</p>
            </div>
          )}
        </section>
      </div>
    </SectionFrame>
  );
}
