import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/admin", label: "Admin Overview", end: true, icon: "📊" },
  { to: "/admin/places", label: "Manage Places", end: true, icon: "📍" },
  { to: "/admin/places/add", label: "Add Place", end: true, icon: "➕" },
  { to: "/admin/feature-images", label: "Feature images", end: false, icon: "🖼️" },
  { to: "/admin/user-locations", label: "Users location", end: false, icon: "🗺️" },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (to: string, end: boolean) => {
    if (end) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile overlay when sidebar is open */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-20 bg-slate-900/50 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-30 h-screen w-64 flex flex-col
          bg-white border-r border-slate-200 shadow-sm
          transition-transform duration-200 ease-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-100">
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:bg-orange-600 transition-colors">
              T
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg block leading-tight">Trinetra</span>
              <span className="text-xs text-slate-500 font-medium">Admin</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map(({ to, label, end, icon }) => {
              const active = isActive(to, end);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? "bg-orange-50 text-orange-700 border border-orange-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                      }
                    `}
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                        active ? "bg-orange-100" : "bg-slate-100"
                      }`}
                    >
                      {icon}
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* View site */}
        <div className="px-4 pb-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-transparent"
          >
            <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base">🔗</span>
            View site
          </a>
        </div>

        {/* User & Sign out */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold shrink-0">
              {user?.displayName?.slice(0, 1)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.displayName || "Admin"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 transition-colors"
          >
            <span aria-hidden>🚪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile: menu button; desktop: optional breadcrumb or empty) */}
        <header className="sticky top-0 z-10 flex items-center gap-4 h-14 px-4 lg:px-8 bg-white/80 backdrop-blur border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden lg:block flex-1">
            <p className="text-sm text-slate-500">Trinetra Admin Dashboard</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
