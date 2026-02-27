import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";

const desktopNavItems = [
  { to: "/dashboard", label: "Home" },
  { to: "/places", label: "Places" },
  { to: "/essentials", label: "Essentials" },
  { to: "/plan", label: "Plan" },
  { to: "/family-connect", label: "Family" },
  { to: "/more", label: "More" },
];

export function UserLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 safe-area-top shrink-0 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-lg sm:text-xl font-bold text-slate-900 hover:text-orange-600 transition-colors"
          >
            Trinetra
          </Link>
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {desktopNavItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <span className="ml-3 pl-3 border-l border-slate-200 text-slate-500 text-sm truncate max-w-[120px]">
              {user?.displayName || "User"}
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-nav md:pb-8">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
