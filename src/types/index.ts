// User roles for Trinetra
export type UserRole = "user" | "admin";

// Feature image (admin-managed, shown on website home)
export interface FeatureImage {
  id: string;
  imageUrl: string;
  title?: string;
  caption?: string;
  sortOrder?: number;
  createdAt: string;
}

// App user (stored in Firestore after signup/login)
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

// Place (pilgrimage / venue)
export interface Place {
  id: string;
  name: string;
  description: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  isPopular?: boolean;
  categoryId?: string;
  /** Matches essential category for "places nearby" e.g. Medical, Toilets, Hospitals */
  placeType?: string;
  /** Display order (lower first); used for category-wise listing */
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

// Essential (item or service)
export interface Essential {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  /** Optional area/location label for "nearby" display e.g. "Sangam", "Station" */
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  /** Display order within category (lower first) */
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

// Category for places/essentials
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sortOrder?: number;
  createdAt: string;
}

// User's itinerary item
export interface ItineraryItem {
  placeId: string;
  placeName: string;
  dayOrder?: number;
  notes?: string;
}

// User-generated itinerary
export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  items: ItineraryItem[];
  createdAt: string;
  updatedAt: string;
}

// Emergency contact / helpline (admin-managed)
export interface EmergencyItem {
  id: string;
  title: string;
  number: string;
  type: "police" | "hospital" | "helpline" | "other";
  description?: string;
  createdAt: string;
}

// Family contact (user's own)
export interface FamilyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relation?: string;
  createdAt: string;
}

// User's last known location (updated in real time when app is open)
export interface UserLocationDoc {
  userId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

// Family circle: members share a code and can see each other's locations
export interface FamilyCircle {
  id: string; // same as code (document ID)
  code: string;
  createdBy: string;
  memberIds: string[];
  createdAt: string;
}

// Firestore paths
export const COLLECTIONS = {
  USERS: "users",
  PLACES: "places",
  ESSENTIALS: "essentials",
  CATEGORIES: "categories",
  ITINERARIES: "itineraries",
  EMERGENCY: "emergency",
  FAMILY_CONTACTS: "familyContacts",
  USER_SELECTED_ESSENTIALS: "userSelectedEssentials",
  FEATURE_IMAGES: "featureImages",
  USER_LOCATIONS: "userLocations",
  FAMILY_CIRCLES: "familyCircles",
} as const;
