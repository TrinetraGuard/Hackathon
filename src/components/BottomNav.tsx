import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/places", label: "Places", icon: "📍" },
  { to: "/essentials", label: "Essentials", icon: "✓" },
  { to: "/plan", label: "Plan", icon: "📋" },
  { to: "/more", label: "More", icon: "⋯" },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom md:hidden"
      role="navigation"
      aria-label="Main"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 tap text-xs font-medium transition-colors ${
                isActive
                  ? "text-orange-600"
                  : "text-slate-500 hover:text-slate-700"
              }`
            }
          >
            <span className="text-lg leading-none mb-0.5" aria-hidden>
              {icon}
            </span>
            <span className="truncate w-full text-center">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
