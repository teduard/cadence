import { Home, Code2, LayoutGrid, Search, LogIn, Printer, Clock } from "lucide-react";
//import "./DockNav.css";
import "./DockNav.css";

const ITEMS = [
  { id: "past_days", icon: Clock, label: "Past Days" },
  { id: "dashboard", icon: Home, label: "Home" },
  { id: "diagnostics", icon: Code2, label: "Cadence DSL" },
  // { id: "grid", icon: LayoutGrid, label: "Dashboard" },
  //{ id: "search", icon: Search, label: "Search" },
  { id: "pdf", icon: Printer, label: "Export PDF:"},
  //{ id: "login", icon: LogIn, label: "Sign in" },

] as const;

export function DockNav({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="dock" aria-label="Primary">
      <div className="dock__pill">
        {ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`dock__btn ${active === id ? "dock__btn--active" : ""}`}
            onClick={() => onSelect(id)}
            aria-label={label}
            aria-current={active === id ? "page" : undefined}
          >
            <Icon size={22} strokeWidth={2} />
            {active === id && <span className="dock__dot" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
