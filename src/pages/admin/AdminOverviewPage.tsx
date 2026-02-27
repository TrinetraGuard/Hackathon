import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminOverview } from "@/services/admin";

const links = [
  { to: "/admin/places", label: "Manage Places", countKey: "placesCount" as const, desc: "Add and edit places" },
  { to: "/admin/places/add", label: "Add Place", desc: "Add a new place" },
  { to: "/admin/feature-images", label: "Feature images", desc: "Home page highlights" },
  { to: "/admin/user-locations", label: "Users location", desc: "Real-time map of user locations" },
];

export default function AdminOverviewPage() {
  const location = useLocation();
  const [overview, setOverview] = useState<{
    usersCount: number;
    placesCount: number;
    essentialsCount: number;
    categoriesCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOverview()
      .then(setOverview)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading overview...</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="card border border-red-200 bg-red-50 text-red-700">
        Failed to load overview.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-600 mt-1">Summary of your app. Use the links below to manage content.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card border border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-xl">
              👥
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Users</p>
              <p className="text-2xl font-bold text-slate-900">{overview.usersCount}</p>
            </div>
          </div>
        </div>

        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`card border transition-all flex flex-col sm:flex-row sm:items-center gap-4 group ${
              location.pathname === link.to
                ? "border-orange-300 bg-orange-50/50 ring-1 ring-orange-200"
                : "border-slate-200 hover:border-slate-300 hover:shadow-md"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl group-hover:bg-orange-200 transition-colors">
              {link.to.includes("places/add") ? "➕" : link.to === "/admin/places" ? "📍" : link.to.includes("feature") ? "🖼️" : "🗺️"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">{link.label}</p>
              <p className="text-slate-500 text-sm mt-0.5">{link.desc}</p>
              {"countKey" in link && link.countKey && (
                <p className="text-slate-600 text-sm font-medium mt-1">{overview[link.countKey]} items</p>
              )}
            </div>
            <span className="text-slate-400 group-hover:text-orange-600 transition-colors text-sm font-medium">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
