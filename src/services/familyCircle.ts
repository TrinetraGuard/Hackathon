import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  collection,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";
import type { FamilyCircle } from "@/types";

const db = getFirestore();
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O, 1/I
const CODE_LENGTH = 6;

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

/** Create a new family circle. Returns the shareable code. */
export async function createFamilyCircle(userId: string): Promise<{ code: string; circle: FamilyCircle }> {
  if (!userId) throw new Error("User ID required");
  let code = generateCode();
  const ref = doc(db, COLLECTIONS.FAMILY_CIRCLES, code);
  // Ensure code is unique (very unlikely collision)
  let existing = await getDoc(ref);
  while (existing.exists()) {
    code = generateCode();
    const retryRef = doc(db, COLLECTIONS.FAMILY_CIRCLES, code);
    existing = await getDoc(retryRef);
    if (!existing.exists()) {
      await setDoc(retryRef, {
        code,
        createdBy: userId,
        memberIds: [userId],
        createdAt: new Date().toISOString(),
      });
      return {
        code,
        circle: {
          id: code,
          code,
          createdBy: userId,
          memberIds: [userId],
          createdAt: new Date().toISOString(),
        },
      };
    }
  }
  await setDoc(ref, {
    code,
    createdBy: userId,
    memberIds: [userId],
    createdAt: new Date().toISOString(),
  });
  return {
    code,
    circle: {
      id: code,
      code,
      createdBy: userId,
      memberIds: [userId],
      createdAt: new Date().toISOString(),
    },
  };
}

/** Join an existing family circle by code. Code is case-insensitive. */
export async function joinFamilyCircle(codeInput: string, userId: string): Promise<FamilyCircle> {
  if (!userId || !codeInput?.trim()) throw new Error("Code and user ID required");
  const code = codeInput.trim().toUpperCase();
  const ref = doc(db, COLLECTIONS.FAMILY_CIRCLES, code);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Invalid or expired code");
  const data = snap.data() as Omit<FamilyCircle, "id">;
  const memberIds: string[] = data.memberIds || [];
  if (memberIds.includes(userId)) return { id: code, code, ...data };
  await updateDoc(ref, { memberIds: arrayUnion(userId) });
  return {
    id: code,
    code,
    createdBy: data.createdBy,
    memberIds: [...memberIds, userId],
    createdAt: data.createdAt,
  };
}

/** Leave the family circle the user is in. */
export async function leaveFamilyCircle(userId: string): Promise<void> {
  if (!userId) return;
  const circle = await getFamilyCircleForUser(userId);
  if (!circle) return;
  const ref = doc(db, COLLECTIONS.FAMILY_CIRCLES, circle.code);
  await updateDoc(ref, { memberIds: arrayRemove(userId) });
}

/** Get the family circle the user belongs to, if any. */
export async function getFamilyCircleForUser(userId: string): Promise<FamilyCircle | null> {
  if (!userId) return null;
  const q = query(
    collection(db, COLLECTIONS.FAMILY_CIRCLES),
    where("memberIds", "array-contains", userId)
  );
  const snap = await getDocs(q);
  const doc = snap.docs[0];
  if (!doc?.exists()) return null;
  return { id: doc.id, code: doc.id, ...doc.data() } as FamilyCircle;
}

/** Get circle by code (for join flow). */
export async function getFamilyCircleByCode(codeInput: string): Promise<FamilyCircle | null> {
  const code = codeInput?.trim().toUpperCase();
  if (!code) return null;
  const ref = doc(db, COLLECTIONS.FAMILY_CIRCLES, code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, code: snap.id, ...snap.data() } as FamilyCircle;
}

/** Subscribe to a family circle by code. Returns unsubscribe. */
export function subscribeToFamilyCircle(
  code: string,
  onUpdate: (circle: FamilyCircle | null) => void
): Unsubscribe {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) {
    onUpdate(null);
    return () => {};
  }
  const ref = doc(db, COLLECTIONS.FAMILY_CIRCLES, normalized);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, code: snap.id, ...snap.data() } as FamilyCircle);
      } else {
        onUpdate(null);
      }
    },
    () => onUpdate(null)
  );
}
