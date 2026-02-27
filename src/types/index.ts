// User roles for Kumbhathon
export type UserRole = "user" | "admin";

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
} as const;
