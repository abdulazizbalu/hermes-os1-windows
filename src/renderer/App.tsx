import { ReactElement, useMemo, useState } from "react";
import { defaultSectionId, OS1SectionId } from "../shared/sections";
import { Sidebar } from "./components/Sidebar";
import { BootScreen } from "./components/BootScreen";
import { getSectionView } from "./views";

export default function App(): ReactElement {
  const [bootComplete, setBootComplete] = useState(false);
  const [activeSection, setActiveSection] = useState<OS1SectionId>(defaultSectionId);
  const ActiveView = useMemo(() => getSectionView(activeSection), [activeSection]);

  if (!bootComplete) {
    return <BootScreen onComplete={() => setBootComplete(true)} />;
  }

  return (
    <div className="os1-app">
      <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />
      <section className="os1-detail">
        <ActiveView />
      </section>
    </div>
  );
}
