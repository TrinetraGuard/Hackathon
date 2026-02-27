/**
 * Browser geolocation and distance helpers.
 */

export interface UserCoords {
  lat: number;
  lng: number;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

/** Request user's current position. Returns null if denied or unavailable. */
export function getUserLocation(): Promise<UserCoords | null> {
  return new Promise((resolve) => {
    if (!navigator?.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      GEO_OPTIONS
    );
  });
}

/** Watch position and call onUpdate when it changes. Returns cleanup function to stop watching. */
export function watchUserLocation(onUpdate: (coords: UserCoords) => void): (() => void) {
  if (!navigator?.geolocation) return () => {};
  const id = navigator.geolocation.watchPosition(
    (pos) => onUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => {},
    { ...GEO_OPTIONS, maximumAge: 30000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}

/** Haversine distance in km between two points. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

/** Format distance for display (e.g. "1.2 km", "450 m"). */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** Google Maps directions URL. Prefers lat/lng; falls back to address. */
export function getMapsDirectionsUrl(opts: {
  latitude?: number;
  longitude?: number;
  address?: string;
}): string {
  const { latitude, longitude, address } = opts;
  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  if (address?.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.trim())}`;
  }
  return "https://www.google.com/maps";
}
