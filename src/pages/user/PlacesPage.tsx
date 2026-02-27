import React, { useEffect, useState } from "react";
import { getPlaces } from "@/services/places";
import type { Place } from "@/types";

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlaces()
      .then(setPlaces)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load places"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading places...</p>
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
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Places</h1>
      <p className="text-slate-600 mb-6">
        Pilgrimage and event locations you can explore.
      </p>
      {places.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          No places have been added yet. Check back later.
        </div>
      ) : (
        <ul className="space-y-4">
          {places.map((place) => (
            <li key={place.id} className="card">
              <h2 className="font-semibold text-slate-900 text-lg">{place.name}</h2>
              <p className="text-slate-600 mt-1">{place.description}</p>
              {place.address && (
                <p className="text-slate-500 text-sm mt-2 flex items-center gap-1">
                  <span>📍</span> {place.address}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
