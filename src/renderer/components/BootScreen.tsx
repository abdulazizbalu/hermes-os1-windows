import { ReactElement, useEffect, useState } from "react";
import { BrandLockup } from "./BrandLockup";

interface BootScreenProps {
  onComplete(): void;
}

export function BootScreen({ onComplete }: BootScreenProps): ReactElement {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="boot-screen">
      <BrandLockup />
      <div className="boot-screen__center">
        <div className="boot-screen__ring" aria-hidden="true" />
        <h1>OS1</h1>
        <p>Рабочее пространство Hermes для Windows</p>
        <button className="os1-button" type="button" disabled={!ready} onClick={onComplete}>
          {ready ? "Начать" : "Запуск"}
        </button>
      </div>
    </main>
  );
}
