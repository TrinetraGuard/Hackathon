import { deletePlace, getPlaces } from "@/services/places";
import type { Category, Place } from "@/types";
import { useEffect, useMemo, useState } from "react";

import { getCategories } from "@/services/categories";
import { Link } from "react-router-dom";

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");

  const loadPlaces = () => {
    setLoading(true);
    getPlaces()
      .then(setPlaces)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlaces();
    getCategories().then(setCategories).catch(() => []);
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this place? This cannot be undone.")) return;
    setError("");
    try {
      await deletePlace(id);
      loadPlaces();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const filteredPlaces = useMemo(() => {
    if (!filterCategoryId) return places;
    if (filterCategoryId === "__uncategorized__") return places.filter((p) => !p.categoryId);
    return places.filter((p) => p.categoryId === filterCategoryId);
  }, [places, filterCategoryId]);

  const placesByCategory = useMemo(() => {
    const map = new Map<string, Place[]>();
    for (const p of filteredPlaces) {
      const key = p.categoryId || "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    // Sort places within each category: sortOrder (asc, undefined last) then name
    map.forEach((list) => {
      list.sort((a, b) => {
        const orderA = a.sortOrder ?? 9999;
        const orderB = b.sortOrder ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
    });
    const catNames = new Map(categories.map((c) => [c.id, c.name]));
    const uncategorized = "Uncategorized";
    const sorted = Array.from(map.entries()).sort(([a], [b]) => {
      if (a === uncategorized) return 1;
      if (b === uncategorized) return -1;
      return (catNames.get(a) || a).localeCompare(catNames.get(b) || b);
    });
    return sorted;
  }, [filteredPlaces, categories]);

  const getCategoryName = (categoryId: string) =>
    categoryId === "Uncategorized" ? "Uncategorized" : (categories.find((c) => c.id === categoryId)?.name ?? categoryId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading places...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage places</h1>
          <p className="text-slate-600 text-sm mt-0.5">
            View, edit, and delete places. Users see these on the app.
          </p>
        </div>
        <Link
          to="/admin/places/add"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors shrink-0"
        >
          <span>➕</span> Add place
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-medium">
            Dismiss
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-700">
            {filteredPlaces.length} place{filteredPlaces.length !== 1 ? "s" : ""}
          </span>
          {categories.length > 0 && (
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="input-field max-w-[220px] py-2 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="__uncategorized__">Uncategorized</option>
            </select>
          )}
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">
              {places.length === 0 ? "No places yet." : "No places in this category."}
            </p>
            <Link
              to="/admin/places/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white font-medium text-sm hover:bg-orange-700"
            >
              ➕ Add your first place
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {placesByCategory.map(([categoryKey, list]) => (
              <div key={categoryKey} className="p-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 text-sm">
                    {categories.find((c) => c.id === categoryKey)?.icon || "📍"}
                  </span>
                  {getCategoryName(categoryKey)} ({list.length})
                </h2>
                <ul className="space-y-2">
                  {list.map((place) => (
                    <li
                      key={place.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/30 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{place.name}</h3>
                          {typeof place.sortOrder === "number" && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-xs font-medium">
                              Order: {place.sortOrder}
                            </span>
                          )}
                          {place.isPopular && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                              Popular
                            </span>
                          )}
                          {place.placeType && (
                            <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-medium">
                              {place.placeType}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mt-0.5 line-clamp-2">{place.description}</p>
                        {place.address && (
                          <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">📍 {place.address}</p>
                        )}
                        {(place.latitude != null || place.longitude != null) && (
                          <p className="text-slate-400 text-xs mt-0.5">
                            {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link
                          to={`/admin/places/add?edit=${place.id}`}
                          className="px-3 py-2 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 border border-orange-200 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(place.id)}
                          className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
