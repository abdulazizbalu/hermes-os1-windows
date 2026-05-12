import { ReactElement } from "react";

export function BrandLockup(): ReactElement {
  return (
    <div className="brand-lockup" aria-label="OS1 by Element Software">
      <div className="brand-lockup__name">
        <span>Element</span>
        <span>Software</span>
      </div>
      <div className="brand-lockup__descriptor">OS1 · COMPUTER USE</div>
    </div>
  );
}
