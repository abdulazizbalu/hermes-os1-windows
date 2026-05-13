import { ReactElement } from "react";

export function BrandLockup(): ReactElement {
  return (
    <div className="brand-lockup" aria-label="Nur">
      <div className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="brand-lockup__text">
        <div className="brand-lockup__name">
          <span>Nur</span>
        </div>
        <div className="brand-lockup__descriptor">Локальный AI-помощник</div>
      </div>
    </div>
  );
}
