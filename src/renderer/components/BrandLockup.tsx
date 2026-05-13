import { ReactElement } from "react";

export function BrandLockup(): ReactElement {
  return (
    <div className="brand-lockup" aria-label="Luma Desktop">
      <div className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="brand-lockup__text">
        <div className="brand-lockup__name">
          <span>Luma</span>
          <span>Desktop</span>
        </div>
        <div className="brand-lockup__descriptor">Local AI Workspace</div>
      </div>
    </div>
  );
}
