import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPlaces } from "@/services/places";
import { getUserItineraries, createItinerary } from "@/services/itinerary";
import type { Place, ItineraryItem } from "@/types";

export default function PlanPage() {
  const { user } = useAuth();
  const userId = user?.uid ?? "";
  const [itineraries, setItineraries] = useState<{ id: string; title: string; items: ItineraryItem[] }[]>([]);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedItems, setSelectedItems] = useState<ItineraryItem[]>([]);

  useEffect(() => {
    if (!userId) return;
    Promise.all([getUserItineraries(userId), getPlaces()])
      .then(([it, places]) => {
        setItineraries(it);
        setAllPlaces(places);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAddPlace = (place: Place) => {
    if (selectedItems.some((i) => i.placeId === place.id)) return;
    setSelectedItems((prev) => [...prev, { placeId: place.id, placeName: place.name }]);
  };

  const handleRemovePlace = (placeId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.placeId !== placeId));
  };

  const handleSave = async () => {
    if (!title.trim() || selectedItems.length === 0) return;
    await createItinerary(userId, title.trim(), selectedItems);
    const list = await getUserItineraries(userId);
    setItineraries(list);
    setTitle("");
    setSelectedItems([]);
    setShowForm(false);
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
      <h1 className="text-2xl font-bold text-slate-900 mb-1">My itineraries</h1>
      <p className="text-slate-600 text-sm mb-6">Create and manage your trip plans.</p>

      {!showForm ? (
        <>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-primary max-w-xs mb-6"
          >
            + New itinerary
          </button>
          {itineraries.length === 0 ? (
            <div className="card text-center py-10 text-slate-500">
              <p className="mb-2">No itineraries yet.</p>
              <p className="text-sm">Create one to plan your visit.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {itineraries.map((it) => (
                <li key={it.id}>
                  <Link
                    to={`/itinerary/${it.id}`}
                    className="card card-hover tap block flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{it.title}</p>
                      <p className="text-slate-500 text-sm">{it.items.length} places</p>
                    </div>
                    <span className="text-slate-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">New itinerary</h2>
          <input
            type="text"
            placeholder="Title (e.g. Day 1 - Sangam)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />
          <p className="text-sm text-slate-600">Add places:</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {allPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() =>
                  selectedItems.some((i) => i.placeId === place.id)
                    ? handleRemovePlace(place.id)
                    : handleAddPlace(place)
                }
                className={`px-3 py-1.5 rounded-lg text-sm font-medium tap ${
                  selectedItems.some((i) => i.placeId === place.id)
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {place.name} {selectedItems.some((i) => i.placeId === place.id) && "✓"}
              </button>
            ))}
          </div>
          {selectedItems.length > 0 && (
            <ol className="text-sm text-slate-600 list-decimal list-inside">
              {selectedItems.map((i) => (
                <li key={i.placeId}>
                  {i.placeName}
                  <button
                    type="button"
                    onClick={() => handleRemovePlace(i.placeId)}
                    className="ml-2 text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!title.trim() || selectedItems.length === 0}
              className="btn-primary max-w-[140px]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setSelectedItems([]);
              }}
              className="btn-secondary max-w-[100px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
