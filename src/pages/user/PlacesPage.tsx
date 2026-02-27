import { PlaceImage } from "@/components/PlaceImage";
import { getCategories } from "@/services/categories";
import { getPlaces } from "@/services/places";
import type { Category, Place } from "@/types";
import { distanceKm, formatDistance, getUserLocation, type UserCoords } from "@/utils/geolocation";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function PlacesPage() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);

  useEffect(() => {
    Promise.all([getPlaces(), getCategories().catch(() => [])])
      .then(([p, c]) => {
        setPlaces(p);
        setCategories(c);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load places"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getUserLocation().then((coords) => coords && setUserCoords(coords));
  }, []);

  const filteredPlacesRaw = categoryId
    ? places.filter((p) => p.categoryId === categoryId)
    : places;

  const filteredPlaces = useMemo(() => {
    if (!userCoords) return filteredPlacesRaw;
    return [...filteredPlacesRaw].sort((a, b) => {
      const aHas = a.latitude != null && a.longitude != null;
      const bHas = b.latitude != null && b.longitude != null;
      if (!aHas && !bHas) return 0;
      if (!aHas) return 1;
      if (!bHas) return -1;
      const distA = distanceKm(userCoords, { lat: a.latitude!, lng: a.longitude! });
      const distB = distanceKm(userCoords, { lat: b.latitude!, lng: b.longitude! });
      return distA - distB;
    });
  }, [filteredPlacesRaw, userCoords]);

  const activeCategory = categories.find((c) => c.id === categoryId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading places...</p>
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
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Places</h1>
      <p className="text-slate-600 mb-4">
        {userCoords
          ? "Places sorted by distance from your location."
          : "Pilgrimage and event locations you can explore."}
      </p>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            href="/places"
            className={`px-4 py-2 rounded-xl text-sm font-medium tap ${
              !categoryId ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/places?category=${cat.id}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium tap ${
                categoryId === cat.id ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </a>
          ))}
        </div>
      )}
      {activeCategory && (
        <p className="text-slate-600 mb-4">
          Showing: <span className="font-medium text-slate-800">{activeCategory.name}</span>
        </p>
      )}
      {filteredPlaces.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          {places.length === 0
            ? "No places have been added yet. Check back later."
            : "No places in this category."}
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredPlaces.map((place) => {
            const distKm =
              userCoords && place.latitude != null && place.longitude != null
                ? distanceKm(userCoords, { lat: place.latitude, lng: place.longitude })
                : null;
            return (
              <li key={place.id} className="card card-hover flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <PlaceImage
                    src={place.imageUrl}
                    alt={place.name}
                    containerClassName="w-full h-full"
                    placeholder={
                      <div className="w-full h-full rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-4xl">
                        📍
                      </div>
                    }
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900 text-lg">{place.name}</h2>
                    {distKm != null && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-orange-100 text-orange-700 text-sm font-medium">
                        {formatDistance(distKm)} away
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-1">{place.description}</p>
                  {place.address && (
                    <p className="text-slate-500 text-sm mt-2 flex items-center gap-1">
                      <span>📍</span> {place.address}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
