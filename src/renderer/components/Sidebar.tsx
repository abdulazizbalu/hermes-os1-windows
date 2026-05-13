import {
  BookOpen,
  Cable,
  ChartNoAxesColumn,
  Clock3,
  Columns3,
  Files,
  KeyRound,
  LayoutDashboard,
  Mail,
  MessageCircle,
  MessagesSquare,
  MicOff,
  Monitor,
  Plug,
  Sparkles,
  Stethoscope,
  Terminal
} from "lucide-react";
import { ReactElement } from "react";
import { os1Sections, OS1SectionId } from "../../shared/sections";
import { BrandLockup } from "./BrandLockup";
import { StatusPill } from "./StatusPill";

const icons = {
  BookOpen,
  Cable,
  ChartNoAxesColumn,
  Clock3,
  Columns3,
  Files,
  KeyRound,
  LayoutDashboard,
  Mail,
  MessageCircle,
  MessagesSquare,
  Monitor,
  Plug,
  Sparkles,
  Stethoscope,
  Terminal
};

interface SidebarProps {
  activeSection: OS1SectionId;
  onSelectSection(section: OS1SectionId): void;
}

export function Sidebar({ activeSection, onSelectSection }: SidebarProps): ReactElement {
  return (
    <aside className="sidebar">
      <div className="sidebar__scroll os1-scroll">
        <BrandLockup />
        <section className="sidebar-card">
          <h2>Локальный AI</h2>
          <p>Gemma E4B работает на вашем Windows-компьютере.</p>
          <StatusPill tone="success">ЛОКАЛЬНО</StatusPill>
        </section>
        <nav className="sidebar__nav" aria-label="Luma sections">
          {os1Sections.map((section) => {
            const Icon = icons[section.icon];
            const selected = activeSection === section.id;

            return (
              <button
                key={section.id}
                className={`sidebar__item ${selected ? "sidebar__item--selected" : ""}`}
                type="button"
                onClick={() => onSelectSection(section.id)}
              >
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>{section.title}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <button className="voice-row" type="button">
        <MicOff size={16} aria-hidden="true" />
        <span>Голос</span>
        <strong>ВЫКЛ</strong>
      </button>
    </aside>
  );
}
