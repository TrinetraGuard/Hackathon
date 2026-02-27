import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPopularPlaces, getPlaces } from "@/services/places";
import { getEssentials } from "@/services/essentials";
import { getCategories } from "@/services/categories";
import {
  getUserSelectedEssentials,
  setUserSelectedEssentials,
} from "@/services/userEssentials";
import type { Place, Essential, Category } from "@/types";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [popularPlaces, setPopularPlaces] = useState<Place[]>([]);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [essentials, setEssentials] = useState<Essential[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedEssentialIds, setSelectedEssentialIds] = useState<string[]>([]);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = user?.uid ?? "";

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      getPopularPlaces().then(setPopularPlaces),
      getPlaces().then(setAllPlaces),
      getEssentials().then(setEssentials),
      getCategories().then(setCategories),
      getUserSelectedEssentials(userId).then(setSelectedEssentialIds),
    ]).finally(() => setLoading(false));
  }, [userId]);

  const essentialsByCategory = essentials.reduce<Record<string, Essential[]>>((acc, e) => {
    const cat = e.category?.trim() || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(e);
    return acc;
  }, {});
  const categoryList = Object.keys(essentialsByCategory).sort();

  const placesForCategory = clickedCategory
    ? allPlaces.filter(
        (p) =>
          p.placeType &&
          p.placeType.trim().toLowerCase() === clickedCategory.trim().toLowerCase()
      )
    : [];

  const handleToggleEssential = async (essentialId: string) => {
    const next = selectedEssentialIds.includes(essentialId)
      ? selectedEssentialIds.filter((id) => id !== essentialId)
      : [...selectedEssentialIds, essentialId];
    setSelectedEssentialIds(next);
    await setUserSelectedEssentials(userId, next);
  };

  const selectedEssentials = essentials.filter((e) => selectedEssentialIds.includes(e.id));
  const nearbyByLocation = selectedEssentials.length
    ? Object.entries(
        selectedEssentials.reduce<Record<string, Essential[]>>((acc, e) => {
          const loc = e.locationLabel || "General";
          if (!acc[loc]) acc[loc] = [];
          acc[loc].push(e);
          return acc;
        }, {})
      )
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-4">
      {/* Hero / Feature */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600 to-orange-700 text-white min-h-[200px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548013146-72479768bada?w=800')] bg-cover bg-center opacity-30" />
        <div className="relative z-10 px-6 py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome, {user?.displayName}
          </h1>
          <p className="text-orange-100 text-sm sm:text-base max-w-md mx-auto">
            Explore places, plan your essentials, and stay connected during Kumbh Mela.
          </p>
        </div>
      </section>

      {/* Popular Places */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Popular Places</h2>
          <Link to="/places" className="text-sm font-medium text-orange-600 hover:underline">
            View all →
          </Link>
        </div>
        {popularPlaces.length === 0 ? (
          <div className="card text-slate-500 text-center py-8">
            No popular places yet.{" "}
            <Link to="/places" className="text-orange-600 hover:underline">Browse all places</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularPlaces.slice(0, 4).map((place) => (
              <Link
                key={place.id}
                to="/places"
                className="card card-hover tap block text-left overflow-hidden p-0"
              >
                <div className="aspect-video bg-slate-200">
                  {place.imageUrl ? (
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl">
                      📍
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 truncate">{place.name}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mt-0.5">{place.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Essential Needs – by category, then places nearby on click */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Essential Needs</h2>
        <p className="text-slate-600 text-sm mb-4">
          Browse by category. Tap a category to see nearby places (e.g. medical, hospitals, toilets).
        </p>
        {essentials.length === 0 ? (
          <div className="card text-slate-500 text-center py-8">No essentials added yet.</div>
        ) : (
          <>
            {categoryList.map((category) => (
              <div key={category} className="mb-6">
                <button
                  type="button"
                  onClick={() => setClickedCategory(clickedCategory === category ? null : category)}
                  className="w-full flex items-center justify-between card card-hover tap text-left mb-2"
                >
                  <span className="font-semibold text-slate-900">{category}</span>
                  <span className="text-slate-500 text-sm">
                    {essentialsByCategory[category].length} item{essentialsByCategory[category].length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-orange-600 text-sm">
                    {clickedCategory === category ? "▼ Hide places" : "▶ Show places nearby"}
                  </span>
                </button>
                <ul className="flex flex-wrap gap-2 mb-2">
                  {essentialsByCategory[category].map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => handleToggleEssential(e.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors tap ${
                        selectedEssentialIds.includes(e.id)
                          ? "bg-orange-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {e.name} {selectedEssentialIds.includes(e.id) && "✓"}
                    </button>
                  ))}
                </ul>
                {clickedCategory === category && (
                  <div className="card bg-orange-50/50 border border-orange-100 mt-2">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Places nearby — {category}
                    </h3>
                    {placesForCategory.length === 0 ? (
                      <p className="text-slate-500 text-sm">No places tagged for this category yet. Check back later.</p>
                    ) : (
                      <ul className="space-y-2">
                        {placesForCategory.map((place) => (
                          <li key={place.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 rounded-lg bg-white border border-slate-100">
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900">{place.name}</p>
                              <p className="text-slate-600 text-sm">{place.description}</p>
                              {place.address && (
                                <p className="text-slate-500 text-xs mt-1">📍 {place.address}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
            {nearbyByLocation.length > 0 && (
              <div className="card bg-slate-50 mt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Your selected essentials by area</h3>
                <div className="space-y-3">
                  {nearbyByLocation.map(([location, items]) => (
                    <div key={location}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        {location}
                      </p>
                      <ul className="space-y-1">
                        {items.map((item) => (
                          <li key={item.id} className="text-slate-700 text-sm flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">✓</span>
                            {item.name} — {item.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Categories</h2>
        {categories.length === 0 ? (
          <div className="card text-slate-500 text-center py-6">No categories yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/places?category=${cat.id}`}
                className="card card-hover tap flex flex-col items-center text-center p-4"
              >
                <span className="text-2xl mb-2">{cat.icon || "📁"}</span>
                <span className="font-medium text-slate-800 text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick links to Plan & More */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/plan"
          className="card card-hover tap flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl group-hover:bg-orange-200 transition-colors">
            📋
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Plan your trip</h3>
            <p className="text-slate-600 text-sm">Create and manage itineraries</p>
          </div>
          <span className="ml-auto text-slate-400 group-hover:text-orange-600">→</span>
        </Link>
        <Link
          to="/more"
          className="card card-hover tap flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-2xl group-hover:bg-red-200 transition-colors">
            🆘
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Emergency & Family</h3>
            <p className="text-slate-600 text-sm">Helplines and family contacts</p>
          </div>
          <span className="ml-auto text-slate-400 group-hover:text-red-600">→</span>
        </Link>
      </section>
    </div>
  );
}
