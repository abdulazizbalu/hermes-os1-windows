import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { defaultSectionId, NurSectionId } from "../shared/sections";
import { NurAppContext, NurAppContextValue } from "./AppContext";
import { BootScreen } from "./components/BootScreen";
import { Sidebar } from "./components/Sidebar";
import { WelcomeWizard } from "./components/WelcomeWizard";
import { getSectionView } from "./views";

type AppState = "boot" | "wizard" | "shell";

const SETUP_COMPLETE_KEY = "nur.setupComplete";

export default function App(): ReactElement {
  const [state, setState] = useState<AppState>("boot");
  const [activeSection, setActiveSection] = useState<NurSectionId>(defaultSectionId);
  const [modelReady, setModelReady] = useState(false);
  const ActiveView = useMemo(() => getSectionView(activeSection), [activeSection]);

  const checkModelReady = useCallback(async (): Promise<boolean> => {
    try {
      const status = await window.os1.localAi.status();
      // "Ready" if Ollama runs AND any Gemma model is installed.
      const anyInstalled = status.models.some((m) => m.installed);
      const ready = status.ollamaRunning && anyInstalled;
      setModelReady(ready);
      return ready;
    } catch {
      setModelReady(false);
      return false;
    }
  }, []);

  async function decideNextState(): Promise<AppState> {
    const ready = await checkModelReady();
    const flagged = window.localStorage.getItem(SETUP_COMPLETE_KEY) === "1";

    if (ready) {
      if (!flagged) window.localStorage.setItem(SETUP_COMPLETE_KEY, "1");
      return "shell";
    }

    // If user previously chose "use later", respect that.
    if (flagged) return "shell";

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
    void checkModelReady();
    setState("shell");
  }

  function handleWizardSkip(): void {
    window.localStorage.setItem(SETUP_COMPLETE_KEY, "1");
    setState("shell");
  }

  const launchWizard = useCallback((): void => {
    setState("wizard");
  }, []);

  const contextValue: NurAppContextValue = useMemo(
    () => ({
      launchWizard,
      modelReady,
      refreshModelReady: async () => {
        await checkModelReady();
      }
    }),
    [launchWizard, modelReady, checkModelReady]
  );

  if (state === "boot") {
    return <BootScreen onComplete={() => undefined} silent />;
  }

  if (state === "wizard") {
    return <WelcomeWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />;
  }

  return (
    <NurAppContext.Provider value={contextValue}>
      <div className="os1-app">
        <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />
        <section className="os1-detail">
          <ActiveView />
        </section>
      </div>
    </NurAppContext.Provider>
  );
}
