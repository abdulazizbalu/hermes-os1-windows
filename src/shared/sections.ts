export const nurSections = [
  { id: "chat", title: "Чат", icon: "MessageCircle" },
  { id: "email", title: "Письма", icon: "Mail" },
  { id: "summarize", title: "Суммировать", icon: "AlignLeft" },
  { id: "translate", title: "Перевести", icon: "Languages" },
  { id: "improve", title: "Улучшить", icon: "Wand2" },
  { id: "converter", title: "Конвертер", icon: "Calculator" },
  { id: "transliterate", title: "Транслитерация", icon: "ArrowRightLeft" },
  { id: "history", title: "История", icon: "Clock3" },
  { id: "settings", title: "Настройки", icon: "Settings" }
] as const;

export type NurSectionId = (typeof nurSections)[number]["id"];

export const defaultSectionId: NurSectionId = "chat";

export const os1Sections = nurSections;
export type OS1SectionId = NurSectionId;
