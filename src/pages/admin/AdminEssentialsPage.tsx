import React, { useEffect, useState } from "react";
import {
  getEssentials,
  createEssential,
  updateEssential,
  deleteEssential,
} from "@/services/essentials";
import type { Essential } from "@/types";

export default function AdminEssentialsPage() {
  const [essentials, setEssentials] = useState<Essential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "", description: "" });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateEssential(editingId, form);
        setEditingId(null);
      } else {
        await createEssential(form);
      }
      setForm({ name: "", category: "", description: "" });
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
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this essential?")) return;
    setError("");
    try {
      await deleteEssential(id);
      loadEssentials();
      if (editingId === id) setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setForm({ name: "", category: "", description: "" });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        Manage Essentials
      </h1>
      <p className="text-slate-600 mb-6">
        Add, edit, or remove essentials visible to users.
      </p>
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="card mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">
          {editingId ? "Edit essential" : "Add new essential"}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="input-field"
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            required
            className="input-field"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            rows={3}
            className="input-field resize-none"
          />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary max-w-[140px]">
              {editingId ? "Update" : "Add essential"}
            </button>
            {editingId && (
              <button type="button" onClick={clearForm} className="btn-secondary max-w-[120px]">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
      <ul className="space-y-3">
        {essentials.map((item) => (
          <li
            key={item.id}
            className="card flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {item.category}
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-1">{item.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleEdit(item)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {essentials.length === 0 && !loading && (
        <p className="text-slate-500 mt-4">No essentials yet. Add one using the form above.</p>
      )}
    </div>
  );
}
