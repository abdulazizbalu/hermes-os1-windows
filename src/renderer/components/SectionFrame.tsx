import { ReactElement, ReactNode } from "react";

interface SectionFrameProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function SectionFrame({ eyebrow, title, description, children }: SectionFrameProps): ReactElement {
  return (
    <main className="section-frame">
      <header className="section-frame__header">
        <div>
          <p className="section-frame__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <p>{description}</p>
      </header>
      <div className="section-frame__body">{children}</div>
    </main>
  );
}
