import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";
import type { Itinerary, ItineraryItem } from "@/types";

const db = getFirestore();

export async function getUserItineraries(userId: string): Promise<Itinerary[]> {
  const q = query(
    collection(db, COLLECTIONS.ITINERARIES),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Itinerary));
  } catch {
    const snap = await getDocs(collection(db, COLLECTIONS.ITINERARIES));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Itinerary))
      .filter((t) => t.userId === userId);
  }
}

export async function getItineraryById(id: string): Promise<Itinerary | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.ITINERARIES, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Itinerary : null;
}

export async function createItinerary(
  userId: string,
  title: string,
  items: ItineraryItem[]
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.ITINERARIES), {
    userId,
    title,
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateItinerary(
  id: string,
  data: { title?: string; items?: ItineraryItem[] }
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.ITINERARIES, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteItinerary(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ITINERARIES, id));
}
