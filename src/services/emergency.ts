import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";
import type { EmergencyItem } from "@/types";

const db = getFirestore();

export async function getEmergencyList(): Promise<EmergencyItem[]> {
  const q = query(collection(db, COLLECTIONS.EMERGENCY), orderBy("type"));
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmergencyItem));
  } catch {
    const snap = await getDocs(collection(db, COLLECTIONS.EMERGENCY));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmergencyItem));
  }
}

export async function createEmergency(
  data: Omit<EmergencyItem, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.EMERGENCY), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateEmergency(
  id: string,
  data: Partial<Omit<EmergencyItem, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.EMERGENCY, id), data);
}

export async function deleteEmergency(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.EMERGENCY, id));
}
