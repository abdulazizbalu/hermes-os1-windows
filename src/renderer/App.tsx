import { ReactElement, useEffect, useMemo, useState } from "react";
import { defaultSectionId, NurSectionId } from "../shared/sections";
import { BootScreen } from "./components/BootScreen";
import { Sidebar } from "./components/Sidebar";
import { WelcomeWizard } from "./components/WelcomeWizard";
import { getSectionView } from "./views";

type AppState = "boot" | "wizard" | "shell";

const SETUP_COMPLETE_KEY = "nur.setupComplete";
const TARGET_MODEL = "gemma4:e4b";

export default function App(): ReactElement {
  const [state, setState] = useState<AppState>("boot");
  const [activeSection, setActiveSection] = useState<NurSectionId>(defaultSectionId);
  const ActiveView = useMemo(() => getSectionView(activeSection), [activeSection]);

  async function decideNextState(): Promise<AppState> {
    const flagged = window.localStorage.getItem(SETUP_COMPLETE_KEY) === "1";

    try {
      const status = await window.os1.localAi.status();
      const modelReady =
        status.ollamaRunning &&
        (status.models.find((m) => m.name === TARGET_MODEL)?.installed ?? false);

      // If model is actually ready, mark setup complete and go straight to shell.
      if (modelReady) {
        if (!flagged) window.localStorage.setItem(SETUP_COMPLETE_KEY, "1");
        return "shell";
      }
    } catch {
      // Status check failed — wizard will handle it.
    }

    // If user previously completed setup but model is somehow gone — re-run wizard.
    return "wizard";
  }

  useEffect(() => {
    if (state !== "boot") return;
    const timer = window.setTimeout(async () => {
      const next = await decideNextState();
      setState(next);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [state]);

  function handleWizardComplete(): void {
    window.localStorage.setItem(SETUP_COMPLETE_KEY, "1");
    setState("shell");
  }

  if (state === "boot") {
    return <BootScreen onComplete={() => undefined} silent />;
  }

  if (state === "wizard") {
    return <WelcomeWizard onComplete={handleWizardComplete} />;
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
