import { PlaceImage } from "@/components/PlaceImage";
import { useAuth } from "@/contexts/AuthContext";
import { addLostFound, getLostFoundList } from "@/services/lostFound";
import { getMapsDirectionsUrl } from "@/utils/geolocation";
import { useEffect, useState } from "react";
import type { LostFoundItem, LostFoundType } from "@/types";

export default function LostFoundPage() {
  const { user } = useAuth();
  const userId = user?.uid ?? "";
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filter, setFilter] = useState<LostFoundType | "">("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "lost" as LostFoundType,
    name: "",
    description: "",
    imageUrl: "",
    contact: "",
    location: "",
  });

  const load = () => {
    setLoading(true);
    getLostFoundList(filter || undefined)
      .then(setItems)
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError("");
    setSubmitting(true);
    try {
      await addLostFound(userId, {
        type: form.type,
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
        contact: form.contact.trim() || undefined,
        location: form.location.trim() || undefined,
      });
      setForm({ type: "lost", name: "", description: "", imageUrl: "", contact: "", location: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter ? items : items;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lost & Found</h1>
        <p className="text-slate-600 text-sm mt-1">
          Report a lost or found person. Anyone can view and help.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex justify-between items-center">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-600 font-medium">Dismiss</button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === "" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("lost")}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === "lost" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Lost
        </button>
        <button
          type="button"
          onClick={() => setFilter("found")}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === "found" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Found
        </button>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="ml-auto px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-medium"
        >
          + Report
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card border border-orange-200 bg-orange-50/30 space-y-4">
          <h2 className="font-semibold text-slate-900">Report lost or found person</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LostFoundType }))}
              className="input-field"
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Name (or description)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="input-field"
          />
          <textarea
            placeholder="Description (age, clothes, last seen, etc.)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            rows={3}
            className="input-field resize-none"
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Contact (phone or email)"
            value={form.contact}
            onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Location / area where lost or found"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="input-field"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary">Submit</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-slate-500 text-sm">
          No reports yet. Be the first to report a lost or found person.
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item) => (
            <li key={item.id} className="card border border-slate-200 overflow-hidden">
              <div className="flex gap-4">
                {item.imageUrl ? (
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <PlaceImage src={item.imageUrl} alt={item.name} containerClassName="w-full h-full" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-slate-200 flex items-center justify-center text-3xl text-slate-400 shrink-0">
                    {item.type === "lost" ? "🔍" : "✓"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${item.type === "lost" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                      {item.type === "lost" ? "Lost" : "Found"}
                    </span>
                    {(item.status ?? "open") === "resolved" && (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-600">Resolved</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-slate-600 text-sm mt-0.5 line-clamp-2">{item.description}</p>
                  {item.contact && <p className="text-slate-500 text-xs mt-1">Contact: {item.contact}</p>}
                  {item.location && <p className="text-slate-500 text-xs">Location: {item.location}</p>}
                  {item.latitude != null && item.longitude != null && (
                    <a
                      href={getMapsDirectionsUrl({ latitude: item.latitude, longitude: item.longitude })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-orange-600 text-sm font-medium"
                    >
                      Open in Maps →
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
