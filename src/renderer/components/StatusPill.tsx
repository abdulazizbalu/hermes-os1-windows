import { ReactElement } from "react";

interface StatusPillProps {
  tone: "muted" | "warning" | "success" | "danger";
  children: string;
}

export function StatusPill({ tone, children }: StatusPillProps): ReactElement {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}
