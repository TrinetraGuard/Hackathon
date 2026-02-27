import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";

export function UserLayout() {
  const { user } = useAuth();

  return (
    <div className="pg min-h-[100dvh] bg-slate-50 flex flex-col">
      {/* Top bar: compact on mobile, full nav on desktop */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 safe-area-top shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="text-lg md:text-xl font-bold text-slate-800 tap">
            Trinetra
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm"
            >
              Home
            </Link>
            <Link
              to="/places"
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm"
            >
              Places
            </Link>
            <Link
              to="/essentials"
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm"
            >
              Essentials
            </Link>
            <Link
              to="/plan"
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm"
            >
              Plan
            </Link>
            <Link
              to="/more"
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm"
            >
              More
            </Link>
            <span className="text-slate-500 text-sm border-l border-slate-200 pl-4 ml-2">
              {user?.displayName}
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 md:py-6 pb-nav md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
