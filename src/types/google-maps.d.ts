/** Minimal types for Google Maps Places used in googlePlaces.ts */
declare global {
  interface Window {
    google?: typeof google;
    initGoogleMapsResolver?: () => void;
  }
}

export interface LatLng {
  lat: () => number;
  lng: () => number;
}

export interface PlaceResult {
  name?: string;
  vicinity?: string;
  place_id?: string;
  types?: string[];
  geometry?: { location?: LatLng };
}

export interface PlaceSearchRequest {
  location: LatLng;
  radius: number;
  type?: string;
  keyword?: string;
}

export interface PlacesServiceInstance {
  nearbySearch(
    request: PlaceSearchRequest,
    callback: (results: PlaceResult[] | null, status: string) => void
  ): void;
}

export interface MapMarkerInstance {
  setMap(map: unknown | null): void;
  setPosition?(pos: LatLng): void;
}

export interface MapInstance {
  setCenter(center: LatLng): void;
  setZoom(zoom: number): void;
  fitBounds(bounds: LatLngBoundsInstance, padding?: { top?: number; right?: number; bottom?: number; left?: number }): void;
}

export interface LatLngBoundsInstance {
  extend(point: LatLng): void;
}

export interface GoogleMaps {
  maps: {
    Map: new (el: HTMLElement, opts?: { center?: { lat: number; lng: number }; zoom?: number }) => MapInstance;
    LatLng: new (lat: number, lng: number) => LatLng;
    LatLngBounds: new () => LatLngBoundsInstance;
    Marker: new (opts?: { position?: LatLng; map?: unknown; title?: string; label?: string | { text: string; color: string } }) => MapMarkerInstance;
    places: {
      PlacesService: new (map: unknown) => PlacesServiceInstance;
      PlacesServiceInstance: PlacesServiceInstance;
      PlacesServiceStatus: {
        OK: string;
        ZERO_RESULTS: string;
        ERROR: string;
      };
    };
  };
}

declare const google: GoogleMaps;

export {};
