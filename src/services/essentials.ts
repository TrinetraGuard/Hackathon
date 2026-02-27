import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";
import type { Essential } from "@/types";

const db = getFirestore();

export async function getEssentials(): Promise<Essential[]> {
  const q = query(
    collection(db, COLLECTIONS.ESSENTIALS),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Essential));
  list.sort((a, b) => {
    const catCmp = (a.category || "").localeCompare(b.category || "");
    if (catCmp !== 0) return catCmp;
    const orderA = a.sortOrder ?? 9999;
    const orderB = b.sortOrder ?? 9999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || "").localeCompare(b.name || "");
  });
  return list;
}

export async function getEssentialById(id: string): Promise<Essential | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.ESSENTIALS, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Essential : null;
}

export async function createEssential(data: Omit<Essential, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.ESSENTIALS), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateEssential(id: string, data: Partial<Omit<Essential, "id" | "createdAt">>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.ESSENTIALS, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteEssential(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ESSENTIALS, id));
}
