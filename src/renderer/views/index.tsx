import { ComponentType, ReactElement } from "react";
import { OS1SectionId } from "../../shared/sections";
import { ConnectionsView } from "./ConnectionsView";
import { SectionStubView } from "./SectionStubView";

export function getSectionView(section: OS1SectionId): ComponentType {
  if (section === "connections") {
    return ConnectionsView;
  }

  const titles: Record<OS1SectionId, string> = {
    connections: "Connections",
    overview: "Overview",
    sessions: "Sessions",
    cronjobs: "Cron Jobs",
    kanban: "Kanban",
    files: "Files",
    usage: "Usage",
    skills: "Skills",
    knowledgeBase: "Knowledge Base",
    connectors: "Connectors",
    providers: "Providers",
    mail: "Mail",
    messaging: "Messaging",
    terminal: "Terminal",
    doctor: "Doctor",
    desktop: "Desktop"
  };

  return function View(): ReactElement {
    return (
      <SectionStubView
        eyebrow={titles[section]}
        title={titles[section]}
        description={`${titles[section]} will keep the same OS1 host-first workflow when its parity slice is implemented.`}
      />
    );
  };
}
