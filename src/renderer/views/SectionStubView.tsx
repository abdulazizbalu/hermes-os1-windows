import { ReactElement } from "react";
import { SectionFrame } from "../components/SectionFrame";

interface SectionStubViewProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionStubView({ eyebrow, title, description }: SectionStubViewProps): ReactElement {
  return (
    <SectionFrame eyebrow={eyebrow} title={title} description={description}>
      <div className="empty-panel">
        <p>Windows parity surface is reserved for this OS1 section.</p>
      </div>
    </SectionFrame>
  );
}
