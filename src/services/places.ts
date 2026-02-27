import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { COLLECTIONS } from "@/types";
import type { Place } from "@/types";
import { getFirestore } from "@/config/firebase";

const db = getFirestore();

export async function getPlaces(): Promise<Place[]> {
  const q = query(
    collection(db, COLLECTIONS.PLACES),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Place));
  list.sort((a, b) => {
    const orderA = a.sortOrder ?? 9999;
    const orderB = b.sortOrder ?? 9999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || "").localeCompare(b.name || "");
  });
  return list;
}

export async function getPopularPlaces(): Promise<Place[]> {
  const all = await getPlaces();
  const popular = all.filter((p) => p.isPopular);
  return popular.length > 0 ? popular.slice(0, 8) : all.slice(0, 8);
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.PLACES, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Place : null;
}

export async function createPlace(data: Omit<Place, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.PLACES), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updatePlace(id: string, data: Partial<Omit<Place, "id" | "createdAt">>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.PLACES, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deletePlace(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.PLACES, id));
}
