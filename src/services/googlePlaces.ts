/**
 * Nearby places via Google Maps JavaScript API (PlacesService).
 * Works in the browser without CORS. Requires VITE_GOOGLE_PLACES_API_KEY in .env.
 * Enable "Maps JavaScript API" and "Places API" in Google Cloud for the key.
 */

import type { PlaceResult, PlacesServiceInstance, PlaceSearchRequest } from "@/types/google-maps";

const API_KEY = (import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string)?.trim();
const DEFAULT_LOCATION = { lat: 25.4358, lng: 81.8463 };
const RADIUS_M = 15000;

export interface GooglePlaceResult {
  name: string;
  address: string;
  placeId?: string;
  types?: string[];
  latitude?: number;
  longitude?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

const placeTypeToGoogleType: Record<string, string> = {
  Medical: "hospital",
  Hospitals: "hospital",
  Pharmacies: "pharmacy",
  Toilets: "",
};

let scriptLoadPromise: Promise<void> | null = null;
let placesService: PlacesServiceInstance | null = null;

/** Load Google Maps JS API (used by Places and admin map). Call before using map or places. */
export function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === "undefined" || !API_KEY) return Promise.reject(new Error("No API key"));
  if (window.google?.maps?.places?.PlacesService) return Promise.resolve();

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      if (window.google?.maps?.places) {
        resolve();
        return;
      }
      const check = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    const callbackName = "initGoogleMapsResolver";
    (window as unknown as { [key: string]: () => void })[callbackName] = () => {
      if (window.google?.maps?.places) resolve();
      else reject(new Error("Places API failed to load"));
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY)}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

function getPlacesService(): PlacesServiceInstance {
  if (placesService) return placesService;
  const g = window.google;
  if (!g?.maps?.places?.PlacesService) throw new Error("Google Maps not loaded");

  const div = document.createElement("div");
  div.style.width = "1px";
  div.style.height = "1px";
  div.style.position = "absolute";
  div.style.left = "-9999px";
  div.style.top = "0";
  document.body.appendChild(div);

  const map = new g.maps.Map(div, { center: DEFAULT_LOCATION, zoom: 1 });
  placesService = new g.maps.places.PlacesService(map);
  return placesService;
}

export async function fetchNearbyPlaces(
  category: string,
  limit = 15,
  userLocation?: UserLocation | null
): Promise<GooglePlaceResult[]> {
  if (!API_KEY) return [];

  const location = userLocation ?? DEFAULT_LOCATION;
  const type = placeTypeToGoogleType[category];
  const keyword = category === "Toilets" ? "public toilet" : undefined;

  try {
    await loadGoogleMapsScript();
    const g = window.google;
    if (!g?.maps?.places?.PlacesServiceStatus) return [];
    const service = getPlacesService();
    const latLng = new g.maps.LatLng(location.lat, location.lng);

    return new Promise((resolve) => {
      const request: PlaceSearchRequest = {
        location: latLng,
        radius: RADIUS_M,
      };
      if (type) request.type = type;
      if (keyword) request.keyword = keyword;

      const statusOk = g.maps.places.PlacesServiceStatus.OK;
      const statusZero = "ZERO_RESULTS";
      service.nearbySearch(request, (results: PlaceResult[] | null, status: string) => {
        if (status !== statusOk && status !== statusZero) {
          resolve([]);
          return;
        }
        const list = (results || []).slice(0, limit).map((p: PlaceResult) => {
          const loc = p.geometry?.location;
          const lat = typeof loc?.lat === "function" ? (loc as { lat: () => number }).lat() : (loc as { lat?: number })?.lat;
          const lng = typeof loc?.lng === "function" ? (loc as { lng: () => number }).lng() : (loc as { lng?: number })?.lng;
          return {
            name: p.name || "Unnamed",
            address: p.vicinity || "",
            placeId: p.place_id,
            types: p.types,
            latitude: typeof lat === "number" ? lat : undefined,
            longitude: typeof lng === "number" ? lng : undefined,
          };
        });
        resolve(list);
      });
    });
  } catch {
    return [];
  }
}

export const DEFAULT_ESSENTIAL_CATEGORIES = [
  "Medical",
  "Hospitals",
  "Pharmacies",
  "Toilets",
] as const;
