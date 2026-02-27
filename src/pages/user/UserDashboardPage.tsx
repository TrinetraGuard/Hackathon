import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function UserDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        Welcome, {user?.displayName}
      </h1>
      <p className="text-slate-600 mb-8">
        Explore places and essentials for your Kumbh Mela experience.
      </p>
      <div className="grid sm:grid-cols-2 gap-5">
        <Link
          to="/places"
          className="card card-hover tap block text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-blue-200 transition-colors">
            📍
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Places</h2>
          <p className="text-slate-600 text-sm">
            View pilgrimage and event locations with details and addresses.
          </p>
          <span className="inline-block mt-3 text-blue-600 font-medium text-sm group-hover:underline">
            View places →
          </span>
        </Link>
        <Link
          to="/essentials"
          className="card card-hover tap block text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-blue-200 transition-colors">
            ✓
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Essentials</h2>
          <p className="text-slate-600 text-sm">
            Check essential items and services for your visit.
          </p>
          <span className="inline-block mt-3 text-blue-600 font-medium text-sm group-hover:underline">
            View essentials →
          </span>
        </Link>
      </div>
    </div>
  );
}
