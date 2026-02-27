import React, { useEffect, useState } from "react";
import { getEssentials } from "@/services/essentials";
import type { Essential } from "@/types";

export default function EssentialsPage() {
  const [essentials, setEssentials] = useState<Essential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEssentials()
      .then(setEssentials)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load essentials"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading essentials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border border-red-200 bg-red-50 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Essentials</h1>
      <p className="text-slate-600 mb-6">
        Essential items and services for your visit.
      </p>
      {essentials.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          No essentials have been added yet. Check back later.
        </div>
      ) : (
        <ul className="space-y-4">
          {essentials.map((item) => (
            <li key={item.id} className="card">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-slate-900 text-lg">{item.name}</h2>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {item.category}
                </span>
              </div>
              <p className="text-slate-600 mt-2">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
