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
        <p>Этот раздел Luma зарезервирован для следующего Windows-слоя.</p>
      </div>
    </SectionFrame>
  );
}
