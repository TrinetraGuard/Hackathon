import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsScript } from "@/services/googlePlaces";
import { subscribeToAllUserLocations, type UserLocationWithId } from "@/services/userLocation";

const DEFAULT_CENTER = { lat: 25.4358, lng: 81.8463 };
const DEFAULT_ZOOM = 12;

export default function AdminUserLocationsPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown | null>(null);
  const markersRef = useRef<google.maps.MapMarkerInstance[]>([]);
  const [locations, setLocations] = useState<UserLocationWithId[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mapRef.current) return;
    const apiKey = (import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string)?.trim();
    if (!apiKey) {
      setError("Add VITE_GOOGLE_PLACES_API_KEY to .env for the map.");
      return;
    }
    loadGoogleMapsScript()
      .then(() => {
        if (!mapRef.current || !window.google?.maps) return;
        const map = new window.google.maps.Map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });
        mapInstanceRef.current = map;
        setMapReady(true);
      })
      .catch(() => setError("Failed to load map. Check your API key and enable Maps JavaScript API."));
  }, []);

  useEffect(() => {
    if (!mapReady || !window.google?.maps) return;
    const unsubscribe = subscribeToAllUserLocations((list) => {
      setLocations(list);
      const map = mapInstanceRef.current as google.maps.Map | null;
      if (!map) return;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      const bounds = new window.google.maps.LatLngBounds();
      let hasAny = false;
      list.forEach((loc, index) => {
        const lat = loc.latitude;
        const lng = loc.longitude;
        if (lat == null || lng == null) return;
        hasAny = true;
        const position = new window.google.maps.LatLng(lat, lng);
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: `User ${loc.userId}`,
          label: { text: String(index + 1), color: "white" },
        });
        markersRef.current.push(marker);
        bounds.extend(position);
      });
      if (hasAny && list.length > 0) {
        const m = map as { setCenter: (c: unknown) => void; setZoom: (z: number) => void; fitBounds: (b: unknown, p?: object) => void };
        if (list.length === 1) {
          m.setCenter(new window.google.maps.LatLng(list[0].latitude!, list[0].longitude!));
          m.setZoom(14);
        } else {
          m.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        }
      }
    });
    return () => {
      unsubscribe();
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [mapReady]);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Users location</h1>
        <p className="text-slate-600 mt-1">Real-time locations of users who have shared their position. Updates live as they move.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card border border-slate-200 p-0 overflow-hidden">
            <div className="relative h-[400px] sm:h-[500px] bg-slate-200">
            <div className="absolute inset-0" ref={mapRef} />
            {!mapReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          </div>
        </div>
        <div>
          <div className="card border border-slate-200">
            <h2 className="font-semibold text-slate-900 mb-3">Live users ({locations.length})</h2>
            {locations.length === 0 ? (
              <p className="text-slate-500 text-sm">No user locations yet. Users appear here when they open the app and allow location.</p>
            ) : (
              <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                {locations.map((loc, idx) => (
                  <li
                    key={loc.userId}
                    className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">User {loc.userId.slice(0, 8)}…</p>
                      <p className="text-xs text-slate-500">
                        {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatTime(loc.updatedAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
