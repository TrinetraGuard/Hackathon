import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { getFamilyCircleForUser } from "@/services/familyCircle";
import { setUserLocation } from "@/services/userLocation";
import { getUserLocation, watchUserLocation } from "@/utils/geolocation";

const desktopNavItems = [
  { to: "/dashboard", label: "Home" },
  { to: "/places", label: "Places" },
  { to: "/essentials", label: "Essentials" },
  { to: "/plan", label: "Plan" },
  { to: "/family-connect", label: "Family" },
  { to: "/assistant", label: "Assistant" },
  { to: "/lost-found", label: "Lost & Found" },
  { to: "/more", label: "More" },
];

export function UserLayout() {
  const { user } = useAuth();
  const userId = user?.uid ?? "";

  // Share location in real time when user is in a family circle (so other members see it on any page)
  useEffect(() => {
    if (!userId) return;
    let stopWatching: (() => void) | null = null;
    getFamilyCircleForUser(userId)
      .then((circle) => {
        if (!circle) return;
        // Write initial location so family sees something immediately
        getUserLocation().then((coords) => {
          if (coords) setUserLocation(userId, coords.lat, coords.lng).catch(() => {});
        });
        // Keep updating location in real time
        stopWatching = watchUserLocation((coords) => {
          setUserLocation(userId, coords.lat, coords.lng).catch(() => {});
        });
      })
      .catch(() => {});
    return () => {
      if (stopWatching) stopWatching();
    };
  }, [userId]);

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
