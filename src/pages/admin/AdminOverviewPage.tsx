import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminOverview } from "@/services/admin";

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<{
    usersCount: number;
    placesCount: number;
    essentialsCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOverview()
      .then(setOverview)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
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
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Admin Overview</h1>
      <p className="text-slate-600 mb-8">Summary of everything in the app.</p>
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Users</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{overview.usersCount}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Places</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{overview.placesCount}</p>
          <Link
            to="/admin/places"
            className="text-sm font-medium text-blue-600 hover:underline mt-3 inline-block"
          >
            Manage places →
          </Link>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Essentials</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{overview.essentialsCount}</p>
          <Link
            to="/admin/essentials"
            className="text-sm font-medium text-blue-600 hover:underline mt-3 inline-block"
          >
            Manage essentials →
          </Link>
        </div>
      </div>
    </div>
  );
}
