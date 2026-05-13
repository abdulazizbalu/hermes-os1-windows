export const os1Sections = [
  { id: "connections", title: "Подключения", icon: "Plug" },
  { id: "overview", title: "Обзор", icon: "LayoutDashboard" },
  { id: "sessions", title: "Сессии", icon: "MessagesSquare" },
  { id: "cronjobs", title: "Cron-задачи", icon: "Clock3" },
  { id: "kanban", title: "Канбан", icon: "Columns3" },
  { id: "files", title: "Файлы", icon: "Files" },
  { id: "usage", title: "Использование", icon: "ChartNoAxesColumn" },
  { id: "skills", title: "Навыки", icon: "Sparkles" },
  { id: "knowledgeBase", title: "База знаний", icon: "BookOpen" },
  { id: "connectors", title: "Коннекторы", icon: "Cable" },
  { id: "providers", title: "Провайдеры", icon: "KeyRound" },
  { id: "mail", title: "Почта", icon: "Mail" },
  { id: "messaging", title: "Сообщения", icon: "MessageCircle" },
  { id: "terminal", title: "Терминал", icon: "Terminal" },
  { id: "doctor", title: "Диагностика", icon: "Stethoscope" },
  { id: "desktop", title: "Рабочий стол", icon: "Monitor" }
] as const;

export type OS1SectionId = (typeof os1Sections)[number]["id"];

export const defaultSectionId: OS1SectionId = "connections";
