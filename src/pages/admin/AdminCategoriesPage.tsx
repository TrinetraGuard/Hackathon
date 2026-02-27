import React, { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categories";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", sortOrder: 0 });

  const loadCategories = () => {
    setLoading(true);
    getCategories()
      .then(setCategories)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const slug = form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, "-");
      if (editingId) {
        await updateCategory(editingId, { ...form, slug });
        setEditingId(null);
      } else {
        await createCategory({ ...form, slug, sortOrder: form.sortOrder ?? 0 });
      }
      setForm({ name: "", slug: "", icon: "", sortOrder: categories.length });
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon ?? "",
      sortOrder: cat.sortOrder ?? 0,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    setError("");
    try {
      await deleteCategory(id);
      loadCategories();
      if (editingId === id) setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Manage Categories</h1>
        <p className="text-slate-600 mt-1">Categories for filtering places in the app. Order is used for display.</p>
      </div>
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-medium">Dismiss</button>
        </div>
      )}
      <section className="card border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {editingId ? "Edit category" : "Add category"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Icon (emoji e.g. 📍)"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Sort order"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
            className="input-field"
          />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary max-w-[140px]">
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", slug: "", icon: "", sortOrder: categories.length });
                }}
                className="btn-secondary max-w-[100px]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All categories ({categories.length})</h2>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="card flex justify-between items-center border border-slate-200"
          >
            <div className="flex items-center gap-3">
              {cat.icon && <span className="text-2xl">{cat.icon}</span>}
              <div>
                <p className="font-semibold text-slate-900">{cat.name}</p>
                <p className="text-slate-500 text-sm">{cat.slug}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleEdit(cat)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {categories.length === 0 && !loading && (
        <div className="card border border-slate-200 text-center py-12 text-slate-500">No categories yet. Add one above.</div>
      )}
      </section>
    </div>
  );
}
