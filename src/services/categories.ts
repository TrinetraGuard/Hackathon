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
import type { Category } from "@/types";

const db = getFirestore();

export async function getCategories(): Promise<Category[]> {
  const q = query(
    collection(db, COLLECTIONS.CATEGORIES),
    orderBy("sortOrder", "asc")
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  } catch {
    const snap = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.CATEGORIES, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Category : null;
}

export async function createCategory(
  data: Omit<Category, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CATEGORIES, id), data);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id));
}
