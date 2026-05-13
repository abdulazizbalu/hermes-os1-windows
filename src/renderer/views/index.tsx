import { ComponentType, ReactElement } from "react";
import { NurSectionId } from "../../shared/sections";
import { ChatView } from "./ChatView";
import { ConverterView } from "./ConverterView";
import { EmailView } from "./EmailView";
import { HistoryView } from "./HistoryView";
import { ImproveView } from "./ImproveView";
import { SectionStubView } from "./SectionStubView";
import { SettingsView } from "./SettingsView";
import { SummarizeView } from "./SummarizeView";
import { TranslateView } from "./TranslateView";
import { TransliterateView } from "./TransliterateView";

const viewMap: Partial<Record<NurSectionId, ComponentType>> = {
  chat: ChatView,
  email: EmailView,
  summarize: SummarizeView,
  translate: TranslateView,
  improve: ImproveView,
  converter: ConverterView,
  transliterate: TransliterateView,
  history: HistoryView,
  settings: SettingsView
};

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
  converter: {
    title: "Конвертер",
    description: "Единицы, валюты, размеры файлов, число прописью."
  },
  transliterate: {
    title: "Транслитерация",
    description: "Кириллица ↔ латиница для русского и узбекского."
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
  const view = viewMap[section];
  if (view) return view;

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
