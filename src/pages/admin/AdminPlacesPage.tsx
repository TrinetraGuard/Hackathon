import React, { useEffect, useState } from "react";
import { getPlaces, createPlace, updatePlace, deletePlace } from "@/services/places";
import type { Place } from "@/types";

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", address: "" });

  const loadPlaces = () => {
    setLoading(true);
    getPlaces()
      .then(setPlaces)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updatePlace(editingId, form);
        setEditingId(null);
      } else {
        await createPlace(form);
      }
      setForm({ name: "", description: "", address: "" });
      loadPlaces();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleEdit = (place: Place) => {
    setEditingId(place.id);
    setForm({
      name: place.name,
      description: place.description,
      address: place.address ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this place?")) return;
    setError("");
    try {
      await deletePlace(id);
      loadPlaces();
      if (editingId === id) setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setForm({ name: "", description: "", address: "" });
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
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Manage Places</h1>
      <p className="text-slate-600 mb-6">Add, edit, or remove places visible to users.</p>
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="card mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">
          {editingId ? "Edit place" : "Add new place"}
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
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            rows={3}
            className="input-field resize-none"
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="input-field"
          />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary max-w-[140px]">
              {editingId ? "Update" : "Add place"}
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
        {places.map((place) => (
          <li
            key={place.id}
            className="card flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3"
          >
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900">{place.name}</h3>
              <p className="text-slate-600 text-sm mt-1">{place.description}</p>
              {place.address && (
                <p className="text-slate-500 text-xs mt-2">📍 {place.address}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleEdit(place)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(place.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {places.length === 0 && !loading && (
        <p className="text-slate-500 mt-4">No places yet. Add one using the form above.</p>
      )}
    </div>
  );
}
