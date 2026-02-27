import {
  createFamilyCircle,
  getFamilyCircleForUser,
  joinFamilyCircle,
  leaveFamilyCircle,
  subscribeToFamilyCircle,
} from "@/services/familyCircle";
import { distanceKm, formatDistance } from "@/utils/geolocation";
import { setUserLocation, subscribeToUserLocation } from "@/services/userLocation";
import { useEffect, useRef, useState } from "react";

import type { FamilyCircle } from "@/types";
import type { UserLocationDoc } from "@/types";
import { getAppUsersByIds } from "@/services/auth";
import { loadGoogleMapsScript } from "@/services/googlePlaces";
import { useAuth } from "@/contexts/AuthContext";
import { watchUserLocation } from "@/utils/geolocation";

const DEFAULT_MAP = { lat: 25.4358, lng: 81.8463 };
const DEFAULT_ZOOM = 12;

export default function FamilyConnectPage() {
  const { user } = useAuth();
  const userId = user?.uid ?? "";
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.MapInstance | null>(null);
  const markersRef = useRef<google.maps.MapMarkerInstance[]>([]);

  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [memberLocations, setMemberLocations] = useState<Record<string, UserLocationDoc | null>>({});
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [mapReady, setMapReady] = useState(false);

  // Load user's circle on mount
  useEffect(() => {
    if (!userId) return;
    getFamilyCircleForUser(userId)
      .then((c) => setCircle(c))
      .catch(() => setError("Failed to load family circle"))
      .finally(() => setInitialLoad(false));
  }, [userId]);

  // Subscribe to circle updates (member list)
  useEffect(() => {
    if (!circle?.code) return;
    const unsub = subscribeToFamilyCircle(circle.code, (updated) => {
      setCircle(updated ?? null);
    });
    return unsub;
  }, [circle?.code]);

  // Fetch display names for members
  useEffect(() => {
    if (!circle?.memberIds?.length) return;
    getAppUsersByIds(circle.memberIds).then((map) => {
      const next: Record<string, string> = {};
      map.forEach((u, uid) => {
        next[uid] = u.displayName || u.email || "Family member";
      });
      setMemberNames((prev) => ({ ...prev, ...next }));
    });
  }, [circle?.memberIds]);

  // Watch current user location and publish to Firestore so family can see
  useEffect(() => {
    if (!userId || !circle) return;
    const stop = watchUserLocation((coords) => {
      setUserCoords(coords);
      setUserLocation(userId, coords.lat, coords.lng).catch(() => {});
    });
    return stop;
  }, [userId, circle]);

  // Subscribe to each member's location
  useEffect(() => {
    if (!circle?.memberIds?.length) return;
    const unsubs: (() => void)[] = [];
    circle.memberIds.forEach((memberId) => {
      const unsub = subscribeToUserLocation(memberId, (loc) => {
        setMemberLocations((prev) => ({ ...prev, [memberId]: loc }));
      });
      unsubs.push(unsub);
    });
    return () => unsubs.forEach((u) => u());
  }, [circle?.memberIds]);

  // Load map
  useEffect(() => {
    if (!mapRef.current) return;
    const apiKey = (import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string)?.trim();
    if (!apiKey) return;
    loadGoogleMapsScript()
      .then(() => {
        if (!mapRef.current || !window.google?.maps) return;
        const map = new window.google.maps.Map(mapRef.current, {
          center: DEFAULT_MAP,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });
        mapInstanceRef.current = map;
        setMapReady(true);
      })
      .catch(() => {});
  }, []);

  // Update map markers: current user + all members
  useEffect(() => {
    if (!mapReady || !window.google?.maps || !circle) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasAny = false;

    // Current user
    if (userCoords) {
      const pos = new window.google.maps.LatLng(userCoords.lat, userCoords.lng);
      const marker = new window.google.maps.Marker({
        position: pos,
        map,
        title: "You",
        label: { text: "You", color: "white" },
      });
      markersRef.current.push(marker);
      bounds.extend(pos);
      hasAny = true;
    }

    // Members (exclude self)
    circle.memberIds.forEach((memberId) => {
      if (memberId === userId) return;
      const loc = memberLocations[memberId];
      if (!loc?.latitude || loc.longitude == null) return;
      const pos = new window.google.maps.LatLng(loc.latitude, loc.longitude);
      const name = memberNames[memberId] || `Member ${memberId.slice(0, 6)}`;
      const marker = new window.google.maps.Marker({
        position: pos,
        map,
        title: name,
        label: { text: "•", color: "white" },
      });
      markersRef.current.push(marker);
      bounds.extend(pos);
      hasAny = true;
    });

    if (hasAny) {
      const m = map as unknown as { setCenter: (c: unknown) => void; setZoom: (z: number) => void; fitBounds: (b: unknown, p?: object) => void };
      if (userCoords) {
        m.setCenter(new window.google.maps.LatLng(userCoords.lat, userCoords.lng));
        m.setZoom(markersRef.current.length === 1 ? 14 : 12);
      }
      if (markersRef.current.length > 1) {
        m.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      }
    }

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [mapReady, circle, userId, userCoords, memberLocations, memberNames]);

  const handleCreate = async () => {
    setError("");
    setCreateLoading(true);
    try {
      const { circle: c } = await createFamilyCircle(userId);
      setCircle(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create code");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    try {
      const c = await joinFamilyCircle(joinCode.trim(), userId);
      setCircle(c);
      setJoinCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid or expired code");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Leave this family circle? You can rejoin later with the same code.")) return;
    setError("");
    setLeaveLoading(true);
    try {
      await leaveFamilyCircle(userId);
      setCircle(null);
      setMemberLocations({});
      setMemberNames({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to leave");
    } finally {
      setLeaveLoading(false);
    }
  };

  const copyCode = () => {
    if (!circle?.code) return;
    navigator.clipboard.writeText(circle.code);
    // Could show a toast
  };

  if (initialLoad) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  // Not in a circle: show create / join
  if (!circle) {
    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Family Connect</h1>
          <p className="text-slate-600 text-sm mt-1">
            Create a code and share it with family. Everyone who joins can see each other&apos;s location on the map.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="text-red-600 font-medium">Dismiss</button>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-2">Create a family code</h2>
            <p className="text-slate-600 text-sm mb-4">You&apos;ll get a code to share. Family members enter it to join.</p>
            <button
              type="button"
              onClick={handleCreate}
              disabled={createLoading}
              className="btn-primary w-full sm:w-auto disabled:opacity-60"
            >
              {createLoading ? "Creating…" : "Create code"}
            </button>
          </div>

          <div className="card border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-2">Join with a code</h2>
            <p className="text-slate-600 text-sm mb-4">Enter the code shared by a family member.</p>
            <form onSubmit={handleJoin} className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="e.g. ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                className="input-field flex-1 min-w-[120px] uppercase font-mono"
              />
              <button type="submit" disabled={joinLoading || !joinCode.trim()} className="btn-primary disabled:opacity-60">
                {joinLoading ? "Joining…" : "Join"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // In a circle: show code, map, list with distances
  const others = circle.memberIds.filter((id) => id !== userId);
  const currentLatLng = userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : null;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Family Connect</h1>
          <p className="text-slate-600 text-sm mt-1">See your family on the map. Share your code so others can join.</p>
        </div>
        <button
          type="button"
          onClick={handleLeave}
          disabled={leaveLoading}
          className="text-red-600 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-lg border border-red-200 disabled:opacity-60"
        >
          {leaveLoading ? "Leaving…" : "Leave circle"}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-600 font-medium">Dismiss</button>
        </div>
      )}

      {/* Shareable code */}
      <div className="card border border-orange-200 bg-orange-50/50 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Your family code</p>
          <p className="text-2xl font-bold font-mono text-orange-700 tracking-widest mt-0.5">{circle.code}</p>
        </div>
        <button type="button" onClick={copyCode} className="btn-secondary">
          Copy code
        </button>
      </div>

      {/* Map */}
      <div className="card border border-slate-200 p-0 overflow-hidden">
        <div className="relative h-[320px] sm:h-[400px] bg-slate-200">
          <div className="absolute inset-0" ref={mapRef} />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Members and distances */}
      <div className="card border border-slate-200">
        <h2 className="font-semibold text-slate-900 mb-3">Family members ({circle.memberIds.length})</h2>
        <ul className="space-y-3">
          {circle.memberIds.map((memberId) => {
            const isMe = memberId === userId;
            const name = isMe ? "You" : (memberNames[memberId] || `Member ${memberId.slice(0, 8)}…`);
            const loc = isMe ? (userCoords ? { latitude: userCoords.lat, longitude: userCoords.lng } : null) : memberLocations[memberId];
            const distance =
              currentLatLng && loc?.latitude != null && loc?.longitude != null
                ? distanceKm(currentLatLng, { lat: loc.latitude, lng: loc.longitude })
                : null;

            return (
              <li
                key={memberId}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <span className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {isMe ? "You" : (memberNames[memberId]?.[0] || "?").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{name}</p>
                  {distance != null ? (
                    <p className="text-slate-600 text-sm">{formatDistance(distance)} away</p>
                  ) : (
                    <p className="text-slate-500 text-sm">{isMe ? "Your location" : "Location not shared yet"}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
