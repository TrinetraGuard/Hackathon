import {
    createEssential,
    deleteEssential,
    getEssentials,
    updateEssential,
} from "@/services/essentials";
import { useEffect, useMemo, useState } from "react";

import { DEFAULT_ESSENTIAL_CATEGORIES } from "@/services/googlePlaces";
import type { Essential } from "@/types";

const emptyForm = {
  name: "",
  category: "",
  description: "",
  locationLabel: "",
  sortOrder: 0,
};

const suggestedCategories = [...DEFAULT_ESSENTIAL_CATEGORIES];

export default function AdminEssentialsPage() {
  const [essentials, setEssentials] = useState<Essential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadEssentials = () => {
    setLoading(true);
    getEssentials()
      .then(setEssentials)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEssentials();
  }, []);

  const existingCategories = useMemo(() => {
    const set = new Set(essentials.map((e) => e.category.trim()).filter(Boolean));
    return [...suggestedCategories, ...Array.from(set).sort()];
  }, [essentials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        locationLabel: form.locationLabel.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) {
        await updateEssential(editingId, payload);
        setEditingId(null);
      } else {
        await createEssential(payload);
      }
      setForm(emptyForm);
      loadEssentials();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleEdit = (item: Essential) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      locationLabel: item.locationLabel ?? "",
      sortOrder: item.sortOrder ?? 0,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this essential? This cannot be undone.")) return;
    setError("");
    try {
      await deleteEssential(id);
      loadEssentials();
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const essentialsByCategory = useMemo(() => {
    const map = new Map<string, Essential[]>();
    for (const e of essentials) {
      const cat = e.category?.trim() || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(e);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [essentials]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading essentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Manage Essentials</h1>
        <p className="text-slate-600 mt-1">Add and edit essential needs. Users see them by category; places tagged with the same type show under &quot;Places nearby&quot;.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-medium">
            Dismiss
          </button>
        </div>
      )}

      <section className="card border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {editingId ? "Edit essential" : "Add new essential"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="input-field"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__other__") {
                    const custom = window.prompt("Enter category name (e.g. Medical, Toilets):");
                    if (custom?.trim()) setForm((f) => ({ ...f, category: custom.trim() }));
                  } else {
                    setForm((f) => ({ ...f, category: v }));
                  }
                }}
                required
                className="input-field"
              >
                <option value="">Select category</option>
                {existingCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {form.category && !existingCategories.includes(form.category) && (
                  <option value={form.category}>{form.category} (custom)</option>
                )}
                <option value="__other__">+ Other (type custom)</option>
              </select>
            </div>
          </div>
          <textarea
            placeholder="Description *"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            rows={3}
            className="input-field resize-none"
          />
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              placeholder="Location / area (optional, e.g. Sangam, Station)"
              value={form.locationLabel}
              onChange={(e) => setForm((f) => ({ ...f, locationLabel: e.target.value }))}
              className="input-field max-w-xs"
            />
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Sort order</span>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
                className="input-field w-20"
              />
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary max-w-[160px]">
              {editingId ? "Update" : "Add essential"}
            </button>
            {editingId && (
              <button type="button" onClick={clearForm} className="btn-secondary max-w-[120px]">
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All essentials by category ({essentials.length})</h2>
        {essentials.length === 0 ? (
          <div className="card border border-slate-200 text-center py-12 text-slate-500">
            No essentials yet. Add one using the form above.
          </div>
        ) : (
          <div className="space-y-6">
            {essentialsByCategory.map(([category, list]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                    {category.slice(0, 1)}
                  </span>
                  {category} ({list.length})
                </h3>
                <ul className="space-y-2">
                  {list.map((item) => (
                    <li
                      key={item.id}
                      className={`card flex flex-col sm:flex-row sm:items-center gap-3 border transition-colors ${
                        editingId === item.id ? "border-orange-400 bg-orange-50/50" : "border-slate-200"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{item.name}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                            {item.category}
                          </span>
                          {typeof item.sortOrder === "number" && (
                            <span className="text-slate-400 text-xs">Order: {item.sortOrder}</span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mt-0.5 line-clamp-2">{item.description}</p>
                        {item.locationLabel && (
                          <p className="text-slate-500 text-xs mt-1">📍 {item.locationLabel}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 border border-orange-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200"
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
      </section>
    </div>
  );
}
