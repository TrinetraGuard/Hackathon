import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getItineraryById, deleteItinerary } from "@/services/itinerary";
import type { Itinerary } from "@/types";

export default function ItineraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getItineraryById(id)
      .then((data) => {
        if (data && data.userId === user?.uid) setItinerary(data);
        else setItinerary(null);
      })
      .finally(() => setLoading(false));
  }, [id, user?.uid]);

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this itinerary?")) return;
    await deleteItinerary(id);
    window.history.back();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-600 mb-4">Itinerary not found.</p>
        <Link to="/plan" className="text-orange-600 hover:underline">
          Back to Plan
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/plan" className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block tap">
            ← Back to Plan
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{itinerary.title}</h1>
          <p className="text-slate-600 text-sm mt-1">
            {itinerary.items.length} place{itinerary.items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="text-sm text-red-600 hover:underline"
        >
          Delete itinerary
        </button>
      </div>
      <ol className="space-y-3">
        {itinerary.items.map((item, index) => (
          <li key={item.placeId} className="card flex items-center gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-slate-900">{item.placeName}</p>
              {item.notes && (
                <p className="text-slate-600 text-sm mt-0.5">{item.notes}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
