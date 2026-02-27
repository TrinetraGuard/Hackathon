import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/places", label: "Places", icon: "📍" },
  { to: "/essentials", label: "Essentials", icon: "✓" },
  { to: "/plan", label: "Plan", icon: "📋" },
  { to: "/family-connect", label: "Family", icon: "👨‍👩‍👧" },
  { to: "/more", label: "More", icon: "⋯" },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-5xl mx-auto">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 transition-colors ${
                isActive
                  ? "text-orange-600 font-semibold"
                  : "text-slate-500 font-medium"
              }`
            }
          >
            <span className="text-xl leading-none mb-0.5" aria-hidden>
              {icon}
            </span>
            <span className="text-xs truncate w-full text-center">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
