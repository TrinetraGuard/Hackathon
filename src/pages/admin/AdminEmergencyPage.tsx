import React, { useEffect, useState } from "react";
import {
  getEmergencyList,
  createEmergency,
  updateEmergency,
  deleteEmergency,
} from "@/services/emergency";
import type { EmergencyItem } from "@/types";

const TYPE_LABELS: Record<EmergencyItem["type"], string> = {
  police: "Police",
  hospital: "Hospital",
  helpline: "Helpline",
  other: "Other",
};

export default function AdminEmergencyPage() {
  const [list, setList] = useState<EmergencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    number: string;
    type: EmergencyItem["type"];
    description: string;
  }>({ title: "", number: "", type: "helpline", description: "" });

  const load = () => {
    setLoading(true);
    getEmergencyList()
      .then(setList)
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
        await updateEmergency(editingId, form);
        setEditingId(null);
      } else {
        await createEmergency(form);
      }
      setForm({ title: "", number: "", type: "helpline", description: "" });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleEdit = (item: EmergencyItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      number: item.number,
      type: item.type,
      description: item.description ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this emergency contact?")) return;
    setError("");
    try {
      await deleteEmergency(id);
      load();
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
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Emergency Contacts</h1>
      <p className="text-slate-600 mb-6">Manage emergency numbers shown to users.</p>
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="card mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">
          {editingId ? "Edit" : "Add"} emergency contact
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title (e.g. Police Control Room)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            className="input-field"
          />
          <input
            type="text"
            placeholder="Phone number"
            value={form.number}
            onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
            required
            className="input-field"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as EmergencyItem["type"] }))}
            className="input-field"
          >
            {(Object.keys(TYPE_LABELS) as EmergencyItem["type"][]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
                  setForm({ title: "", number: "", type: "helpline", description: "" });
                }}
                className="btn-secondary max-w-[100px]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
      <ul className="space-y-3">
        {list.map((item) => (
          <li key={item.id} className="card flex justify-between items-center border-l-4 border-red-200">
            <div>
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-slate-600">{item.number}</p>
              <p className="text-slate-500 text-sm">{TYPE_LABELS[item.type]}</p>
            </div>
            <div className="flex gap-2">
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
      {list.length === 0 && !loading && (
        <p className="text-slate-500 mt-4">No emergency contacts yet. Add one above.</p>
      )}
    </div>
  );
}
