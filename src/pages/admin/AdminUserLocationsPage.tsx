import { useEffect, useMemo, useRef, useState } from "react";
import { getAppUsersByIds } from "@/services/auth";
import { loadGoogleMapsScript } from "@/services/googlePlaces";
import { subscribeToAllUserLocations, type UserLocationWithId } from "@/services/userLocation";
import type { MapMarkerInstance, MapInstance } from "@/types/google-maps";

const DEFAULT_CENTER = { lat: 25.4358, lng: 81.8463 };
const DEFAULT_ZOOM = 12;

function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const sec = Math.floor((now - d.getTime()) / 1000);
    if (sec < 10) return "Just now";
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

function formatFullTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminUserLocationsPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null);
  const markersRef = useRef<MapMarkerInstance[]>([]);
  const [locations, setLocations] = useState<UserLocationWithId[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);

  // Map init: run when ref is available (retry once if needed for strict mode)
  useEffect(() => {
    const apiKey = (import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string)?.trim();
    if (!apiKey) {
      setError("Add VITE_GOOGLE_PLACES_API_KEY to .env and enable Maps JavaScript API in Google Cloud.");
      return;
    }
    const el = mapRef.current;
    if (!el) return;
    setError("");
    loadGoogleMapsScript()
      .then(() => {
        const g = window.google;
        if (!mapRef.current || !g?.maps) {
          setError("Failed to load map.");
          return;
        }
        const map = new g.maps.Map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });
        mapInstanceRef.current = map;
        setMapReady(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load map. Check your API key and enable Maps JavaScript API.");
      });
  }, []);

  // Real-time subscription to all user locations
  useEffect(() => {
    if (!mapReady || !window.google?.maps) return;
    const g = window.google;
    const unsubscribe = subscribeToAllUserLocations((list) => {
      setLocations(list);
      setIsLive(true);
      const map = mapInstanceRef.current;
      if (!map) return;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      const bounds = new g.maps.LatLngBounds();
      let hasAny = false;
      list.forEach((loc, index) => {
        const lat = loc.latitude;
        const lng = loc.longitude;
        if (lat == null || lng == null) return;
        hasAny = true;
        const position = new g.maps.LatLng(lat, lng);
        const marker = new g.maps.Marker({
          position,
          map,
          title: loc.userId,
          label: { text: String(index + 1), color: "white" },
        });
        markersRef.current.push(marker);
        bounds.extend(position);
      });
      if (hasAny && list.length > 0) {
        if (list.length === 1) {
          map.setCenter(new g.maps.LatLng(list[0].latitude!, list[0].longitude!));
          map.setZoom(14);
        } else {
          map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        }
      }
    });
    return () => {
      unsubscribe();
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [mapReady]);

  // Fetch display names for user IDs (for sidebar list)
  const userIds = useMemo(() => locations.map((l) => l.userId), [locations]);
  useEffect(() => {
    if (userIds.length === 0) return;
    getAppUsersByIds(userIds).then((userMap) => {
      const next: Record<string, string> = {};
      userMap.forEach((u, uid) => {
        next[uid] = u.displayName || u.email || "User";
      });
      setUserNames((prev) => ({ ...prev, ...next }));
    });
  }, [userIds.join(",")]);

  const displayName = (loc: UserLocationWithId) =>
    userNames[loc.userId] || loc.userId.slice(0, 8) + "…";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User locations</h1>
          <p className="text-slate-600 mt-1">
            All users who have shared their position. Locations update in real time as they move.
          </p>
        </div>
        {isLive && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            Live
          </span>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-sm flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-amber-700 hover:text-amber-900 font-medium shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card border border-slate-200 p-0 overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="font-medium text-slate-700 text-sm">Map</span>
              {locations.length > 0 && (
                <span className="text-slate-500 text-xs">{locations.length} user{locations.length !== 1 ? "s" : ""} on map</span>
              )}
            </div>
            <div className="relative h-[400px] sm:h-[500px] bg-slate-200">
              <div className="absolute inset-0 w-full h-full" ref={mapRef} />
              {!mapReady && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100">
                  <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-600 text-sm">Loading map…</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="card border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Users</h2>
              <span className="text-slate-500 text-sm tabular-nums">{locations.length}</span>
            </div>
            <div className="p-3">
              {locations.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  <p className="font-medium text-slate-600">No locations yet</p>
                  <p className="mt-1 text-slate-400 text-xs">
                    Users appear here when they open the app and share their location (e.g. Family Connect).
                  </p>
                </div>
              ) : (
                <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {locations.map((loc, idx) => (
                    <li
                      key={loc.userId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
                    >
                      <span className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate" title={loc.userId}>
                          {displayName(loc)}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {loc.latitude?.toFixed(5)}, {loc.longitude?.toFixed(5)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5" title={formatFullTime(loc.updatedAt)}>
                          {formatRelativeTime(loc.updatedAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
