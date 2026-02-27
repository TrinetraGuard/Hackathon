import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";
import type { FeatureImage } from "@/types";

const db = getFirestore();

export async function getFeatureImages(): Promise<FeatureImage[]> {
  const q = query(
    collection(db, COLLECTIONS.FEATURE_IMAGES),
    orderBy("sortOrder", "asc")
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FeatureImage));
  } catch {
    const snap = await getDocs(collection(db, COLLECTIONS.FEATURE_IMAGES));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FeatureImage));
    list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return list;
  }
}

export async function createFeatureImage(
  data: Omit<FeatureImage, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.FEATURE_IMAGES), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateFeatureImage(
  id: string,
  data: Partial<Omit<FeatureImage, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.FEATURE_IMAGES, id), data);
}

export async function deleteFeatureImage(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.FEATURE_IMAGES, id));
}
