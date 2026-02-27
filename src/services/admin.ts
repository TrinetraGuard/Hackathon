import { collection, getDocs } from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";

const db = getFirestore();

export async function getUsersCount(): Promise<number> {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));
  return snap.size;
}

export async function getPlacesCount(): Promise<number> {
  const snap = await getDocs(collection(db, COLLECTIONS.PLACES));
  return snap.size;
}

export async function getEssentialsCount(): Promise<number> {
  const snap = await getDocs(collection(db, COLLECTIONS.ESSENTIALS));
  return snap.size;
}

export interface AdminOverview {
  usersCount: number;
  placesCount: number;
  essentialsCount: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [usersCount, placesCount, essentialsCount] = await Promise.all([
    getUsersCount(),
    getPlacesCount(),
    getEssentialsCount(),
  ]);
  return { usersCount, placesCount, essentialsCount };
}
