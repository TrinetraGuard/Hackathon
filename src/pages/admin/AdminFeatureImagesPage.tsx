import { useEffect, useState } from "react";
import {
  getFeatureImages,
  createFeatureImage,
  updateFeatureImage,
  deleteFeatureImage,
} from "@/services/featureImages";
import type { FeatureImage } from "@/types";

export default function AdminFeatureImagesPage() {
  const [images, setImages] = useState<FeatureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    imageUrl: "",
    title: "",
    caption: "",
    sortOrder: 0,
  });

  const load = () => {
    setLoading(true);
    getFeatureImages()
      .then(setImages)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateFeatureImage(editingId, form);
        setEditingId(null);
      } else {
        await createFeatureImage(form);
      }
      setForm({ imageUrl: "", title: "", caption: "", sortOrder: images.length });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleEdit = (item: FeatureImage) => {
    setEditingId(item.id);
    setForm({
      imageUrl: item.imageUrl,
      title: item.title ?? "",
      caption: item.caption ?? "",
      sortOrder: item.sortOrder ?? 0,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this feature image?")) return;
    setError("");
    try {
      await deleteFeatureImage(id);
      load();
      if (editingId === id) setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Feature images</h1>
      <p className="text-slate-600 mb-6">Images shown in the scrolling section on the website home. Order by sort order.</p>
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="card mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">
          {editingId ? "Edit image" : "Add image"}
        </h2>
        <div className="space-y-4">
          <input
            type="url"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            required
            className="input-field"
          />
          <input
            type="text"
            placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={form.caption}
            onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
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
                  setForm({ imageUrl: "", title: "", caption: "", sortOrder: images.length });
                }}
                className="btn-secondary max-w-[100px]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
      <ul className="space-y-4">
        {images.map((item) => (
          <li key={item.id} className="card flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-48 h-32 rounded-lg bg-slate-100 overflow-hidden shrink-0">
              <img
                src={item.imageUrl}
                alt={item.title || "Feature"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              {item.title && <p className="font-semibold text-slate-900">{item.title}</p>}
              {item.caption && <p className="text-slate-600 text-sm mt-1">{item.caption}</p>}
              <p className="text-slate-500 text-xs mt-1">Order: {item.sortOrder ?? 0}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleEdit(item)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50"
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
      {images.length === 0 && !loading && (
        <p className="text-slate-500 mt-4">No feature images yet. Add one to show on the home page.</p>
      )}
    </div>
  );
}
