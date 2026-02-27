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
} from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";
import type { FamilyContact } from "@/types";

const db = getFirestore();

export async function getUserFamilyContacts(userId: string): Promise<FamilyContact[]> {
  const q = query(
    collection(db, COLLECTIONS.FAMILY_CONTACTS),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FamilyContact));
}

export async function addFamilyContact(
  userId: string,
  data: Omit<FamilyContact, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.FAMILY_CONTACTS), {
    userId,
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateFamilyContact(
  id: string,
  data: Partial<Omit<FamilyContact, "id" | "userId" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.FAMILY_CONTACTS, id), data);
}

export async function deleteFamilyContact(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.FAMILY_CONTACTS, id));
}
