import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";

const db = getFirestore();

const DOC_ID = "selected";

export interface UserSelectedEssentials {
  userId: string;
  essentialIds: string[];
  updatedAt: string;
}

export async function getUserSelectedEssentials(
  userId: string
): Promise<string[]> {
  const ref = doc(db, COLLECTIONS.USER_SELECTED_ESSENTIALS, `${userId}_${DOC_ID}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data() as UserSelectedEssentials;
  return data.essentialIds ?? [];
}

export async function setUserSelectedEssentials(
  userId: string,
  essentialIds: string[]
): Promise<void> {
  const ref = doc(db, COLLECTIONS.USER_SELECTED_ESSENTIALS, `${userId}_${DOC_ID}`);
  await setDoc(ref, {
    userId,
    essentialIds,
    updatedAt: new Date().toISOString(),
  });
}

export async function toggleUserEssential(
  userId: string,
  essentialId: string
): Promise<string[]> {
  const current = await getUserSelectedEssentials(userId);
  const next = current.includes(essentialId)
    ? current.filter((id) => id !== essentialId)
    : [...current, essentialId];
  await setUserSelectedEssentials(userId, next);
  return next;
}
