import { ComponentType, ReactElement } from "react";
import { OS1SectionId } from "../../shared/sections";
import { ConnectionsView } from "./ConnectionsView";
import { SectionStubView } from "./SectionStubView";

export function getSectionView(section: OS1SectionId): ComponentType {
  if (section === "connections") {
    return ConnectionsView;
  }

  const titles: Record<OS1SectionId, string> = {
    connections: "Подключения",
    overview: "Обзор",
    sessions: "Сессии",
    cronjobs: "Cron-задачи",
    kanban: "Канбан",
    files: "Файлы",
    usage: "Использование",
    skills: "Навыки",
    knowledgeBase: "База знаний",
    connectors: "Коннекторы",
    providers: "Провайдеры",
    mail: "Почта",
    messaging: "Сообщения",
    terminal: "Терминал",
    doctor: "Диагностика",
    desktop: "Рабочий стол"
  };

  return function View(): ReactElement {
    return (
      <SectionStubView
        eyebrow={titles[section]}
        title={titles[section]}
        description={`${titles[section]} сохранит стиль Luma вокруг локальной Gemma, когда будет реализован этот слой.`}
      />
    );
  };
}
