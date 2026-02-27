import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="pg min-h-screen bg-slate-100">
      <header className="bg-slate-800 text-white border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/admin" className="text-xl font-bold">
            Trinetra Admin
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/admin"
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white font-medium text-sm"
            >
              Overview
            </Link>
            <Link
              to="/admin/places"
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white font-medium text-sm"
            >
              Places
            </Link>
            <Link
              to="/admin/essentials"
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white font-medium text-sm"
            >
              Essentials
            </Link>
            <Link
              to="/admin/categories"
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white font-medium text-sm"
            >
              Categories
            </Link>
            <Link
              to="/admin/emergency"
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white font-medium text-sm"
            >
              Emergency
            </Link>
            <Link
              to="/admin/feature-images"
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white font-medium text-sm"
            >
              Feature images
            </Link>
            <span className="hidden sm:inline text-slate-400 text-sm border-l border-slate-600 pl-4 ml-2">
              {user?.displayName}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-red-300 text-sm font-medium"
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
