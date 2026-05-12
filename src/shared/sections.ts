export const os1Sections = [
  { id: "connections", title: "Connections", icon: "Plug" },
  { id: "overview", title: "Overview", icon: "LayoutDashboard" },
  { id: "sessions", title: "Sessions", icon: "MessagesSquare" },
  { id: "cronjobs", title: "Cron Jobs", icon: "Clock3" },
  { id: "kanban", title: "Kanban", icon: "Columns3" },
  { id: "files", title: "Files", icon: "Files" },
  { id: "usage", title: "Usage", icon: "ChartNoAxesColumn" },
  { id: "skills", title: "Skills", icon: "Sparkles" },
  { id: "knowledgeBase", title: "Knowledge Base", icon: "BookOpen" },
  { id: "connectors", title: "Connectors", icon: "Cable" },
  { id: "providers", title: "Providers", icon: "KeyRound" },
  { id: "mail", title: "Mail", icon: "Mail" },
  { id: "messaging", title: "Messaging", icon: "MessageCircle" },
  { id: "terminal", title: "Terminal", icon: "Terminal" },
  { id: "doctor", title: "Doctor", icon: "Stethoscope" },
  { id: "desktop", title: "Desktop", icon: "Monitor" }
] as const;

export type OS1SectionId = (typeof os1Sections)[number]["id"];

export const defaultSectionId: OS1SectionId = "connections";
