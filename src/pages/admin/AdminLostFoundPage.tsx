import { PlaceImage } from "@/components/PlaceImage";
import { getLostFoundList, updateLostFoundStatus } from "@/services/lostFound";
import { getMapsDirectionsUrl } from "@/utils/geolocation";
import { useEffect, useState } from "react";
import type { LostFoundItem, LostFoundStatus, LostFoundType } from "@/types";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminLostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filter, setFilter] = useState<LostFoundType | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getLostFoundList(filter || undefined)
      .then(setItems)
      .catch(() => setError("Failed to load reports"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleStatus = async (id: string, status: LostFoundStatus) => {
    setError("");
    setUpdatingId(id);
    try {
      await updateLostFoundStatus(id, status);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch {
      setError("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const lostCount = items.filter((i) => i.type === "lost").length;
  const foundCount = items.filter((i) => i.type === "found").length;
  const openCount = items.filter((i) => (i.status ?? "open") === "open").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Lost & Found Reports</h1>
        <p className="text-slate-600 mt-1">
          View all reported lost and found persons. Mark as resolved when the case is closed.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex justify-between items-center">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-600 font-medium">Dismiss</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === "" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("lost")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === "lost" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"}`}
          >
            Lost ({filter === "lost" ? items.length : lostCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("found")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === "found" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800"}`}
          >
            Found ({filter === "found" ? items.length : foundCount})
          </button>
        </div>
        {openCount > 0 && (
          <span className="text-sm text-slate-500">
            {openCount} open report{openCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          No lost or found reports yet. Reports from users will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isOpen = (item.status ?? "open") === "open";
            return (
              <div
                key={item.id}
                className={`card border overflow-hidden ${
                  item.type === "lost"
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-emerald-200 bg-emerald-50/30"
                } ${!isOpen ? "opacity-75" : ""}`}
              >
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    {item.imageUrl ? (
                      <PlaceImage src={item.imageUrl} alt={item.name} containerClassName="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-slate-400">
                        {item.type === "lost" ? "🔍" : "✓"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                          item.type === "lost"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {item.type === "lost" ? "LOST PERSON" : "FOUND PERSON"}
                      </span>
                      {!isOpen && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200 text-slate-700">
                          Resolved
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 mt-1.5">{item.name}</h3>
                    <p className="text-slate-600 text-sm mt-0.5">{item.description}</p>
                    {item.contact && (
                      <p className="text-slate-500 text-sm mt-1">
                        <span className="font-medium">Contact:</span> {item.contact}
                      </p>
                    )}
                    {item.location && (
                      <p className="text-slate-500 text-sm">
                        <span className="font-medium">Location:</span> {item.location}
                      </p>
                    )}
                    {item.latitude != null && item.longitude != null && (
                      <a
                        href={getMapsDirectionsUrl({ latitude: item.latitude, longitude: item.longitude })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-orange-600 text-sm font-medium"
                      >
                        Open in Maps →
                      </a>
                    )}
                    <p className="text-slate-400 text-xs mt-2">Reported {formatDate(item.createdAt)}</p>
                  </div>
                  <div className="shrink-0 flex flex-col gap-2">
                    {isOpen ? (
                      <button
                        type="button"
                        onClick={() => handleStatus(item.id, "resolved")}
                        disabled={updatingId === item.id}
                        className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
                      >
                        {updatingId === item.id ? "…" : "Mark resolved"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStatus(item.id, "open")}
                        disabled={updatingId === item.id}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
