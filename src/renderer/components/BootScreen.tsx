import { ReactElement, useEffect, useState } from "react";
import { BrandLockup } from "./BrandLockup";

interface BootScreenProps {
  onComplete(): void;
  silent?: boolean;
}

export function BootScreen({ onComplete, silent = false }: BootScreenProps): ReactElement {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="boot-screen">
      <BrandLockup />
      <div className="boot-screen__center">
        <div className="boot-screen__ring" aria-hidden="true">
          <div className="brand-mark brand-mark--large">
            <span />
            <span />
          </div>
        </div>
        <h1>Nur</h1>
        <p>Локальный AI-помощник для офисных задач</p>
        {silent ? null : (
          <button className="os1-button" type="button" disabled={!ready} onClick={onComplete}>
            {ready ? "Открыть" : "Запуск"}
          </button>
        )}
      </div>
    </main>
  );
}
