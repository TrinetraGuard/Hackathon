import { useEffect, useState } from "react";
import { getEssentials } from "@/services/essentials";
import { getPlaces } from "@/services/places";
import type { Essential, Place } from "@/types";

export default function EssentialsPage() {
  const [essentials, setEssentials] = useState<Essential[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getEssentials(), getPlaces()])
      .then(([e, p]) => {
        setEssentials(e);
        setPlaces(p);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const byCategory = essentials.reduce<Record<string, Essential[]>>((acc, e) => {
    const cat = e.category?.trim() || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(e);
    return acc;
  }, {});
  const categoryList = Object.keys(byCategory).sort();

  const placesForCategory =
    clickedCategory && places.length > 0
      ? places.filter(
          (p) =>
            p.placeType &&
            p.placeType.trim().toLowerCase() === clickedCategory.trim().toLowerCase()
        )
      : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
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
        Browse by category. Tap a category to see nearby places (e.g. medical, hospitals, toilets).
      </p>
      {essentials.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          No essentials have been added yet. Check back later.
        </div>
      ) : (
        <div className="space-y-6">
          {categoryList.map((category) => (
            <div key={category}>
              <button
                type="button"
                onClick={() =>
                  setClickedCategory(clickedCategory === category ? null : category)
                }
                className="w-full flex items-center justify-between card tap text-left mb-2"
              >
                <span className="font-semibold text-slate-900">{category}</span>
                <span className="text-slate-500 text-sm">
                  {byCategory[category].length} item{byCategory[category].length !== 1 ? "s" : ""}
                </span>
                <span className="text-orange-600 text-sm">
                  {clickedCategory === category ? "▼ Hide places" : "▶ Show places nearby"}
                </span>
              </button>
              <ul className="space-y-2 mb-2">
                {byCategory[category].map((item) => (
                  <li key={item.id} className="card flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{item.name}</h2>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                      {item.category}
                    </span>
                    <p className="text-slate-600 text-sm w-full mt-1">{item.description}</p>
                  </li>
                ))}
              </ul>
              {clickedCategory === category && (
                <div className="card bg-orange-50/50 border border-orange-100 mt-2">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Places nearby — {category}
                  </h3>
                  {placesForCategory.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      No places tagged for this category yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {placesForCategory.map((place) => (
                        <li
                          key={place.id}
                          className="p-3 rounded-lg bg-white border border-slate-100"
                        >
                          <p className="font-medium text-slate-900">{place.name}</p>
                          <p className="text-slate-600 text-sm">{place.description}</p>
                          {place.address && (
                            <p className="text-slate-500 text-xs mt-1">📍 {place.address}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
