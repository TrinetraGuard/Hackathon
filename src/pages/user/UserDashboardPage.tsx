import { useAuth } from "@/contexts/AuthContext";
import { getCategories } from "@/services/categories";
import { getEssentials } from "@/services/essentials";
import {
    DEFAULT_ESSENTIAL_CATEGORIES,
    fetchNearbyPlaces,
    type GooglePlaceResult,
} from "@/services/googlePlaces";
import { getPlaces, getPopularPlaces } from "@/services/places";
import {
    getUserSelectedEssentials,
    setUserSelectedEssentials,
} from "@/services/userEssentials";
import { setUserLocation } from "@/services/userLocation";
import type { Category, Essential, Place } from "@/types";
import { distanceKm, formatDistance, getMapsDirectionsUrl, getUserLocation, watchUserLocation, type UserCoords } from "@/utils/geolocation";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const ESSENTIAL_CATEGORY_ICONS: Record<string, string> = {
  Medical: "🏥",
  Hospitals: "🏥",
  Pharmacies: "💊",
  Toilets: "🚻",
};
function getCategoryIcon(cat: string): string {
  return ESSENTIAL_CATEGORY_ICONS[cat] || "📍";
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [popularPlaces, setPopularPlaces] = useState<Place[]>([]);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [essentials, setEssentials] = useState<Essential[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedEssentialIds, setSelectedEssentialIds] = useState<string[]>([]);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [googlePlacesResults, setGooglePlacesResults] = useState<GooglePlaceResult[] | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

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

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getUserLocation().then((coords) => {
      if (cancelled) return;
      if (coords) {
        setUserCoords(coords);
        setUserLocation(userId, coords.lat, coords.lng).catch(() => {});
      } else {
        setLocationDenied(true);
      }
    });
    const stopWatching = watchUserLocation((coords) => {
      if (cancelled) return;
      setUserCoords(coords);
      setUserLocation(userId, coords.lat, coords.lng).catch(() => {});
    });
    return () => {
      cancelled = true;
      stopWatching();
    };
  }, [userId]);

  const essentialsByCategory = essentials.reduce<Record<string, Essential[]>>((acc, e) => {
    const cat = e.category?.trim() || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(e);
    return acc;
  }, {});
  const hasFirestoreEssentials = essentials.length > 0;
  const categoryList = hasFirestoreEssentials
    ? Object.keys(essentialsByCategory).sort()
    : [...DEFAULT_ESSENTIAL_CATEGORIES];

  const placesForCategory = clickedCategory
    ? allPlaces.filter(
        (p) =>
          p.placeType &&
          p.placeType.trim().toLowerCase() === clickedCategory.trim().toLowerCase()
      )
    : [];

  const showGooglePlaces = hasFirestoreEssentials === false && clickedCategory;

  const sortedPlacesByDistance = useMemo(() => {
    if (!userCoords) return allPlaces;
    return [...allPlaces].sort((a, b) => {
      const aHas = a.latitude != null && a.longitude != null;
      const bHas = b.latitude != null && b.longitude != null;
      if (!aHas && !bHas) return 0;
      if (!aHas) return 1;
      if (!bHas) return -1;
      const distA = distanceKm(userCoords, { lat: a.latitude!, lng: a.longitude! });
      const distB = distanceKm(userCoords, { lat: b.latitude!, lng: b.longitude! });
      return distA - distB;
    });
  }, [allPlaces, userCoords]);

  const nearbyPlacesPreview = userCoords ? sortedPlacesByDistance.slice(0, 6) : popularPlaces.slice(0, 4);

  useEffect(() => {
    if (!showGooglePlaces || !clickedCategory) {
      setGooglePlacesResults(null);
      return;
    }
    setLoadingGoogle(true);
    setGooglePlacesResults(null);
    fetchNearbyPlaces(clickedCategory, 15, userCoords)
      .then(setGooglePlacesResults)
      .catch(() => setGooglePlacesResults([]))
      .finally(() => setLoadingGoogle(false));
  }, [showGooglePlaces, clickedCategory, userCoords]);

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
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      {/* Welcome */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-6 sm:py-7">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Hello, {user?.displayName || "Guest"}
          </h1>
          <p className="text-orange-100 text-sm mt-1 max-w-md">
            Explore places, find essentials nearby, and plan your visit.
          </p>
        </div>
        {locationDenied && !userCoords && (
          <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <p className="text-amber-800 text-sm">
              Enable location to see places and essentials near you.
            </p>
          </div>
        )}
      </section>

      {/* Places – Nearby you / Popular */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {userCoords ? "Nearby you" : "Popular places"}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {userCoords
                ? "Sorted by distance from your location"
                : "Discover places to visit"}
            </p>
          </div>
          <Link
            to="/places"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 shrink-0"
          >
            View all
          </Link>
        </div>
        {sortedPlacesByDistance.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm">
            No places yet. <Link to="/places" className="text-orange-600 font-medium hover:underline">Browse places</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyPlacesPreview.map((place) => {
              const distKm =
                userCoords && place.latitude != null && place.longitude != null
                  ? distanceKm(userCoords, { lat: place.latitude, lng: place.longitude })
                  : null;
              return (
                <Link
                  key={place.id}
                  to="/places"
                  className="group rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {place.imageUrl ? (
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
                        📍
                      </div>
                    )}
                    {distKm != null && (
                      <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-slate-900/70 text-white text-xs font-medium">
                        {formatDistance(distKm)}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 truncate">{place.name}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mt-0.5">{place.description}</p>
                    {place.address && (
                      <p className="text-slate-400 text-xs mt-2 truncate flex items-center gap-1">
                        <span>📍</span> {place.address}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Browse by category</h2>
          <p className="text-slate-500 text-sm mb-4">Filter places by type</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/places?category=${cat.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center justify-center text-center hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm transition-all"
              >
                <span className="text-2xl sm:text-3xl mb-2">{cat.icon || "📁"}</span>
                <span className="font-medium text-slate-800 text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Essential needs – horizontal categories + place cards with image & directions */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Essential needs</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Tap a category to see nearby places. Open in Maps for directions.
          </p>
        </div>
        {categoryList.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-500 text-sm">
            No essentials yet. Check back later.
          </div>
        ) : (
          <>
            {/* Horizontal category strip */}
            <div className="px-4 py-4 overflow-x-auto flex gap-2 sm:gap-3 shrink-0">
              {categoryList.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setClickedCategory(clickedCategory === category ? null : category)}
                  className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] py-3 px-3 rounded-xl border-2 transition-all shrink-0 ${
                    clickedCategory === category
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-orange-50/50"
                  }`}
                >
                  <span className="text-2xl sm:text-3xl mb-1">{getCategoryIcon(category)}</span>
                  <span className="text-xs font-semibold text-center leading-tight line-clamp-2">{category}</span>
                </button>
              ))}
            </div>
            {hasFirestoreEssentials && clickedCategory && essentialsByCategory[clickedCategory] && (
              <div className="px-4 pb-3 flex flex-wrap gap-2">
                {essentialsByCategory[clickedCategory].map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => handleToggleEssential(e.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedEssentialIds.includes(e.id)
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {e.name} {selectedEssentialIds.includes(e.id) && "✓"}
                  </button>
                ))}
              </div>
            )}
            {/* Places nearby – horizontal scroll with image + directions */}
            {clickedCategory && (
              <div className="border-t border-slate-100 bg-slate-50/50">
                <p className="px-4 pt-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Places nearby — {clickedCategory}
                  {userCoords && " · Based on your location"}
                </p>
                {showGooglePlaces ? (
                  loadingGoogle ? (
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm py-8">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      Loading places…
                    </div>
                  ) : googlePlacesResults && googlePlacesResults.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto px-4 pb-4 pt-1 snap-x snap-mandatory">
                      {googlePlacesResults.map((place, idx) => {
                        const distKm =
                          userCoords && place.latitude != null && place.longitude != null
                            ? distanceKm(userCoords, { lat: place.latitude, lng: place.longitude })
                            : null;
                        const directionsUrl = getMapsDirectionsUrl({
                          latitude: place.latitude,
                          longitude: place.longitude,
                          address: place.address,
                        });
                        return (
                          <div
                            key={place.placeId || idx}
                            className="flex-shrink-0 w-[180px] sm:w-[200px] rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm snap-start"
                          >
                            <div className="aspect-[4/3] bg-slate-200 flex items-center justify-center text-4xl text-slate-400">
                              📍
                            </div>
                            <div className="p-3">
                              <p className="font-semibold text-slate-900 text-sm line-clamp-2">{place.name}</p>
                              {place.address && (
                                <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">📍 {place.address}</p>
                              )}
                              {distKm != null && (
                                <p className="text-xs text-slate-500 mt-1">{formatDistance(distKm)} away</p>
                              )}
                              <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors"
                              >
                                <span>🗺️</span> Get directions
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-4 py-6 text-slate-500 text-sm text-center">No places found. Enable location and try again.</p>
                  )
                ) : placesForCategory.length === 0 ? (
                  <p className="px-4 py-6 text-slate-500 text-sm text-center">No places in this category yet.</p>
                ) : (
                  <div className="flex gap-4 overflow-x-auto px-4 pb-4 pt-1 snap-x snap-mandatory">
                    {placesForCategory.map((place) => {
                      const distKm =
                        userCoords && place.latitude != null && place.longitude != null
                          ? distanceKm(userCoords, { lat: place.latitude, lng: place.longitude })
                          : null;
                      const directionsUrl = getMapsDirectionsUrl({
                        latitude: place.latitude,
                        longitude: place.longitude,
                        address: place.address,
                      });
                      return (
                        <div
                          key={place.id}
                          className="flex-shrink-0 w-[180px] sm:w-[200px] rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm snap-start"
                        >
                          <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                            {place.imageUrl ? (
                              <img
                                src={place.imageUrl}
                                alt={place.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400">
                                📍
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-semibold text-slate-900 text-sm line-clamp-2">{place.name}</p>
                            {place.address && (
                              <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">📍 {place.address}</p>
                            )}
                            {distKm != null && (
                              <p className="text-xs text-slate-500 mt-1">{formatDistance(distKm)} away</p>
                            )}
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors"
                            >
                              <span>🗺️</span> Get directions
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {nearbyByLocation.length > 0 && (
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm mb-2">Your selected essentials</h3>
                <div className="space-y-2">
                  {nearbyByLocation.map(([location, items]) => (
                    <div key={location}>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{location}</p>
                      <ul className="mt-1 space-y-0.5">
                        {items.map((item) => (
                          <li key={item.id} className="text-slate-700 text-sm flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px]">✓</span>
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

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Quick actions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/plan"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl group-hover:bg-orange-200 transition-colors shrink-0">
              📋
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">Plan your trip</h3>
              <p className="text-slate-500 text-sm mt-0.5">Create and manage itineraries</p>
            </div>
            <span className="text-slate-300 group-hover:text-orange-500 transition-colors shrink-0">→</span>
          </Link>
          <Link
            to="/family-connect"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl group-hover:bg-emerald-200 transition-colors shrink-0">
              👨‍👩‍👧
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">Family Connect</h3>
              <p className="text-slate-500 text-sm mt-0.5">Share a code, see family on the map</p>
            </div>
            <span className="text-slate-300 group-hover:text-orange-500 transition-colors shrink-0">→</span>
          </Link>
          <Link
            to="/more"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-red-200 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-2xl group-hover:bg-red-200 transition-colors shrink-0">
              🆘
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">Emergency & family</h3>
              <p className="text-slate-500 text-sm mt-0.5">Helplines and contacts</p>
            </div>
            <span className="text-slate-300 group-hover:text-red-500 transition-colors shrink-0">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
