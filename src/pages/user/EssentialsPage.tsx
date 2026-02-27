import { PlaceImage } from "@/components/PlaceImage";
import { getEssentials } from "@/services/essentials";
import {
    DEFAULT_ESSENTIAL_CATEGORIES,
    fetchNearbyPlaces,
    type GooglePlaceResult,
} from "@/services/googlePlaces";
import { getPlaces } from "@/services/places";
import type { Essential, Place } from "@/types";
import { distanceKm, formatDistance, getMapsDirectionsUrl, getUserLocation, type UserCoords } from "@/utils/geolocation";
import { useMemo, useEffect, useState } from "react";

const ESSENTIAL_CATEGORY_ICONS: Record<string, string> = {
  All: "📋",
  Medical: "🏥",
  Hospitals: "🏥",
  Pharmacies: "💊",
  Toilets: "🚻",
  "First Aid": "🩹",
  Water: "💧",
  Food: "🍽️",
  Other: "📍",
};
function getCategoryIcon(cat: string): string {
  return ESSENTIAL_CATEGORY_ICONS[cat] || "📍";
}

function placeMatchesCategory(place: Place, category: string): boolean {
  if (!category || category === "All") return Boolean(place.placeType || place.latitude != null);
  const cat = category.trim().toLowerCase();
  const pt = (place.placeType || "").trim().toLowerCase();
  return pt === cat;
}

export default function EssentialsPage() {
  const [essentials, setEssentials] = useState<Essential[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [googlePlacesResults, setGooglePlacesResults] = useState<GooglePlaceResult[] | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);

  useEffect(() => {
    Promise.all([getEssentials(), getPlaces()])
      .then(([e, p]) => {
        setEssentials(e);
        setPlaces(p);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getUserLocation().then((coords) => coords && setUserCoords(coords));
  }, []);

  const byCategory = useMemo(() => {
    const acc: Record<string, Essential[]> = {};
    essentials.forEach((e) => {
      const cat = e.category?.trim() || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(e);
    });
    return acc;
  }, [essentials]);

  const hasFirestoreEssentials = essentials.length > 0;
  const categoriesFromEssentials = Object.keys(byCategory);
  const categoryList = useMemo(() => {
    const set = new Set<string>(["All", ...DEFAULT_ESSENTIAL_CATEGORIES, ...categoriesFromEssentials]);
    return Array.from(set).sort((a, b) => (a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)));
  }, [categoriesFromEssentials]);

  const placesForCategory = useMemo(() => {
    if (!clickedCategory || places.length === 0) return [];
    if (clickedCategory === "All") {
      return places
        .filter((p) => p.latitude != null && p.longitude != null)
        .sort((a, b) => {
          if (!userCoords) return 0;
          const da = distanceKm(userCoords, { lat: a.latitude!, lng: a.longitude! });
          const db = distanceKm(userCoords, { lat: b.latitude!, lng: b.longitude! });
          return da - db;
        });
    }
    return places.filter((p) => placeMatchesCategory(p, clickedCategory));
  }, [clickedCategory, places, userCoords]);

  const essentialsForCategory = useMemo(() => {
    if (!clickedCategory || clickedCategory === "All") return essentials;
    return byCategory[clickedCategory] ?? [];
  }, [clickedCategory, essentials, byCategory]);

  const hasDataForCategory = essentialsForCategory.length > 0 || placesForCategory.length > 0;
  const showGooglePlaces =
    clickedCategory &&
    clickedCategory !== "All" &&
    (!hasFirestoreEssentials || !hasDataForCategory);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading essentials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border border-red-200 bg-red-50 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Essentials</h1>
        <p className="text-slate-600 mt-1">
          Tap a category to see nearby places. Open in Maps for directions.
        </p>
      </div>
      {categoryList.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          No essentials yet. Check back later.
        </div>
      ) : (
        <>
          {/* Horizontal category strip */}
          <div className="overflow-x-auto flex gap-2 sm:gap-3 pb-2">
            {categoryList.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setClickedCategory(clickedCategory === category ? null : category)
                }
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
          {hasFirestoreEssentials && clickedCategory && essentialsForCategory.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="font-semibold text-slate-900 text-sm mb-2">
                {clickedCategory === "All" ? "All essential items" : `Items in ${clickedCategory}`}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {essentialsForCategory.map((item) => (
                  <li
                    key={item.id}
                    className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    {clickedCategory === "All" && item.category && (
                      <span className="text-xs font-medium text-slate-500 uppercase">{item.category}</span>
                    )}
                    <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {clickedCategory && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
              <p className="px-4 pt-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {clickedCategory === "All" ? "All places with location" : `Places nearby — ${clickedCategory}`}
                {userCoords && " · Sorted by distance"}
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
                <p className="px-4 py-6 text-slate-500 text-sm text-center">
                  {clickedCategory === "All" ? "No places with location yet. Add places with coordinates in admin." : "No places in this category yet. Add places with matching type in admin."}
                </p>
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
                          <PlaceImage
                            src={place.imageUrl}
                            alt={place.name}
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                          />
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
        </>
      )}
    </div>
  );
}
