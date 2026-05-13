import { AlignLeft, Clock3, Languages, Mail, MessageCircle, MicOff, Settings, Wand2 } from "lucide-react";
import { ReactElement } from "react";
import { nurSections, NurSectionId } from "../../shared/sections";
import { BrandLockup } from "./BrandLockup";
import { StatusPill } from "./StatusPill";

const icons = {
  AlignLeft,
  Clock3,
  Languages,
  Mail,
  MessageCircle,
  Settings,
  Wand2
};

interface SidebarProps {
  activeSection: NurSectionId;
  onSelectSection(section: NurSectionId): void;
}

export function Sidebar({ activeSection, onSelectSection }: SidebarProps): ReactElement {
  return (
    <aside className="sidebar">
      <div className="sidebar__scroll os1-scroll">
        <BrandLockup />
        <section className="sidebar-card">
          <h2>Локальный AI</h2>
          <p>Gemma 4 работает на вашем компьютере.</p>
          <StatusPill tone="success">ЛОКАЛЬНО</StatusPill>
        </section>
        <nav className="sidebar__nav" aria-label="Разделы Nur">
          {nurSections.map((section) => {
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
        <strong>СКОРО</strong>
      </button>
    </aside>
  );
}
