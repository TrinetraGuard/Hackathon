import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function UserLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="pg min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-slate-800">
            Kumbhathon
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/dashboard"
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm"
            >
              Dashboard
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
            <span className="hidden sm:inline text-slate-500 text-sm border-l border-slate-200 pl-4 ml-2">
              {user?.displayName}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-red-600 text-sm font-medium"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
