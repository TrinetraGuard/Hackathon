import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";
import type { LostFoundItem, LostFoundStatus, LostFoundType } from "@/types";

const db = getFirestore();

export async function getLostFoundList(filterType?: LostFoundType): Promise<LostFoundItem[]> {
  const q = query(collection(db, COLLECTIONS.LOST_FOUND), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  let list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LostFoundItem));
  if (filterType) list = list.filter((i) => i.type === filterType);
  return list;
}

export async function addLostFound(
  userId: string,
  data: Omit<LostFoundItem, "id" | "reportedBy" | "createdAt" | "updatedAt" | "status">
): Promise<string> {
  const payload: Omit<LostFoundItem, "id"> = {
    ...data,
    reportedBy: userId,
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COLLECTIONS.LOST_FOUND), payload as Record<string, unknown>);
  return ref.id;
}

/** Admin: mark a lost/found report as resolved or open. */
export async function updateLostFoundStatus(id: string, status: LostFoundStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.LOST_FOUND, id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}
