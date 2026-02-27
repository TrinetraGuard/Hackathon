import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getPlaces, createPlace, updatePlace, getPlaceById } from "@/services/places";
import { getCategories } from "@/services/categories";
import type { Place, Category } from "@/types";

const emptyForm = {
  name: "",
  description: "",
  latitude: "" as string | number,
  longitude: "" as string | number,
  categoryId: "",
};

export default function AdminAddPlacePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const isEdit = Boolean(editId);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => []);
  }, []);

  useEffect(() => {
    if (!editId) {
      setForm(emptyForm);
      setLoading(false);
      return;
    }
    getPlaceById(editId)
      .then((place) => {
        if (place) {
          setForm({
            name: place.name,
            description: place.description,
            latitude: place.latitude ?? "",
            longitude: place.longitude ?? "",
            categoryId: place.categoryId ?? "",
          });
        }
      })
      .catch(() => setError("Failed to load place"))
      .finally(() => setLoading(false));
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const lat = typeof form.latitude === "string" ? (form.latitude ? Number(form.latitude) : undefined) : form.latitude;
      const lng = typeof form.longitude === "string" ? (form.longitude ? Number(form.longitude) : undefined) : form.longitude;
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        latitude: lat,
        longitude: lng,
        categoryId: form.categoryId || undefined,
      };
      if (isEdit && editId) {
        await updatePlace(editId, payload);
        navigate("/admin/places", { replace: true });
      } else {
        await createPlace(payload);
        setForm(emptyForm);
        navigate("/admin/places", { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading place...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/places"
          className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium"
        >
          ← Back to Manage places
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit place" : "Add new place"}
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            {isEdit
              ? "Update the place details below."
              : "Fill in the details. Name, description, and coordinates are required."}
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-medium">
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Place name *</label>
            <input
              type="text"
              placeholder="e.g. Sangam Ghat"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
            <textarea
              placeholder="Brief description of the place"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={4}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Latitude *</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 25.4358"
                value={form.latitude}
                onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Longitude *</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 81.8463"
                value={form.longitude}
                onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                required
                className="input-field"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="input-field"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary max-w-[180px] disabled:opacity-60"
            >
              {submitting ? "Saving…" : isEdit ? "Update place" : "Add place"}
            </button>
            <Link
              to="/admin/places"
              className="btn-secondary max-w-[120px] text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
