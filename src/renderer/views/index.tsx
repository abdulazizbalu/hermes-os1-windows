import { ComponentType, ReactElement } from "react";
import { NurSectionId } from "../../shared/sections";
import { SettingsView } from "./SettingsView";
import { SectionStubView } from "./SectionStubView";

const sectionMeta: Record<NurSectionId, { title: string; description: string }> = {
  chat: {
    title: "Чат",
    description: "Свободный диалог с Nur. Спросите что угодно — от объяснения сложной темы до помощи в письме."
  },
  email: {
    title: "Письма",
    description: "Напишите письмо за минуту. Укажите получателя, тему и тон — Nur подготовит черновик."
  },
  summarize: {
    title: "Суммировать",
    description: "Вставьте длинный текст или документ — получите краткое содержание и ключевые пункты."
  },
  translate: {
    title: "Перевести",
    description: "Перевод между русским, узбекским и английским с сохранением смысла и тона."
  },
  improve: {
    title: "Улучшить",
    description: "Исправит грамматику, перепишет в нужном стиле, сделает короче или формальнее."
  },
  history: {
    title: "История",
    description: "Все ваши прошлые разговоры с Nur — найдите и продолжите там, где остановились."
  },
  settings: {
    title: "Настройки",
    description: "Управление локальной моделью Gemma 4, рабочей папкой и языком интерфейса."
  }
};

export function getSectionView(section: NurSectionId): ComponentType {
  if (section === "settings") {
    return SettingsView;
  }

  const meta = sectionMeta[section];

  return function View(): ReactElement {
    return (
      <SectionStubView
        eyebrow="Nur"
        title={meta.title}
        description={meta.description}
      />
    );
  };
}
