import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getEmergencyList } from "@/services/emergency";
import { getUserFamilyContacts, addFamilyContact, deleteFamilyContact } from "@/services/familyConnect";
import type { EmergencyItem } from "@/types";

export default function MorePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [emergency, setEmergency] = useState<EmergencyItem[]>([]);
  const [familyContacts, setFamilyContacts] = useState<{ id: string; name: string; phone: string; relation?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [familyForm, setFamilyForm] = useState({ name: "", phone: "", relation: "" });

  const userId = user?.uid ?? "";

  useEffect(() => {
    if (!userId) return;
    Promise.all([getEmergencyList(), getUserFamilyContacts(userId)])
      .then(([e, f]) => {
        setEmergency(e);
        setFamilyContacts(f);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAddFamily = async (e: FormEvent) => {
    e.preventDefault();
    if (!familyForm.name.trim() || !familyForm.phone.trim()) return;
    await addFamilyContact(userId, {
      name: familyForm.name.trim(),
      phone: familyForm.phone.trim(),
      relation: familyForm.relation.trim() || undefined,
    });
    const list = await getUserFamilyContacts(userId);
    setFamilyContacts(list);
    setFamilyForm({ name: "", phone: "", relation: "" });
    setShowFamilyForm(false);
  };

  const handleDeleteFamily = async (id: string) => {
    await deleteFamilyContact(id);
    setFamilyContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">More</h1>
      <p className="text-slate-600 text-sm mb-6">Emergency contacts, family connect, lost & found & account.</p>

      {/* Lost & Found */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Lost & Found</h2>
        <Link
          to="/lost-found"
          className="card flex items-center justify-between group border border-slate-200 hover:border-orange-200 hover:bg-orange-50/30"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-medium text-slate-900">Report or view lost & found people</p>
              <p className="text-slate-500 text-sm">See reports and add new ones</p>
            </div>
          </div>
          <span className="text-slate-400 group-hover:text-orange-600">→</span>
        </Link>
      </section>

      {/* Emergency */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Emergency</h2>
        {emergency.length === 0 ? (
          <div className="card text-slate-500 text-sm">No emergency contacts added yet.</div>
        ) : (
          <div className="space-y-3">
            {emergency.map((item) => (
              <div
                key={item.id}
                className="card border-l-4 border-red-500 bg-red-50/50 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <a href={`tel:${item.number}`} className="text-red-600 font-medium hover:underline">
                    {item.number}
                  </a>
                </div>
                <a
                  href={`tel:${item.number}`}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium tap"
                >
                  Call
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Family Connect */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Family Connect</h2>
        {!showFamilyForm ? (
          <>
            <button
              type="button"
              onClick={() => setShowFamilyForm(true)}
              className="btn-secondary max-w-[200px] mb-4"
            >
              + Add contact
            </button>
            {familyContacts.length === 0 ? (
              <p className="text-slate-500 text-sm">No family contacts yet.</p>
            ) : (
              <ul className="space-y-2">
                {familyContacts.map((c) => (
                  <li key={c.id} className="card flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-slate-600 text-sm">{c.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${c.phone}`} className="text-orange-600 text-sm font-medium">
                        Call
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteFamily(c.id)}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <form onSubmit={handleAddFamily} className="card space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={familyForm.name}
              onChange={(e) => setFamilyForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="input-field"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={familyForm.phone}
              onChange={(e) => setFamilyForm((f) => ({ ...f, phone: e.target.value }))}
              required
              className="input-field"
            />
            <input
              type="text"
              placeholder="Relation (optional)"
              value={familyForm.relation}
              onChange={(e) => setFamilyForm((f) => ({ ...f, relation: e.target.value }))}
              className="input-field"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary max-w-[100px]">Add</button>
              <button
                type="button"
                onClick={() => setShowFamilyForm(false)}
                className="btn-secondary max-w-[100px]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Account */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Account</h2>
        <div className="card flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">{user?.displayName}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
