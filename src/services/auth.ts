import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, getFirestore } from "@/config/firebase";
import type { AppUser, UserRole } from "@/types";

const ADMIN_EMAIL = "admin@trinetra.site";

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = "user"
): Promise<AppUser> {
  const auth = getAuth();
  const db = getFirestore();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  const assignedRole = email.toLowerCase().trim() === ADMIN_EMAIL ? "admin" : role;
  const appUser: AppUser = {
    uid: user.uid,
    email: user.email ?? email,
    displayName,
    role: assignedRole,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, "users", user.uid), appUser);
  return appUser;
}

export async function signIn(email: string, password: string): Promise<AppUser | null> {
  const auth = getAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return getAppUser(user.uid);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuth());
}

export async function getAppUser(uid: string): Promise<AppUser | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

/** Fetch multiple users by ID (e.g. for family circle member names). */
export async function getAppUsersByIds(uids: string[]): Promise<Map<string, AppUser>> {
  const db = getFirestore();
  const map = new Map<string, AppUser>();
  if (uids.length === 0) return map;
  const unique = [...new Set(uids)];
  await Promise.all(
    unique.map(async (uid) => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) map.set(uid, snap.data() as AppUser);
    })
  );
  return map;
}

export function onAuthChange(callback: (user: AppUser | null) => void): () => void {
  return onAuthStateChanged(getAuth(), async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    const appUser = await getAppUser(firebaseUser.uid);
    callback(appUser);
  });
}
