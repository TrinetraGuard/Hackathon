import { collection, doc, setDoc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { getFirestore } from "@/config/firebase";
import { COLLECTIONS } from "@/types";
import type { UserLocationDoc } from "@/types";

const db = getFirestore();

export type UserLocationWithId = UserLocationDoc & { id: string };

/** Subscribe to all user locations in real time (for admin map). Returns unsubscribe. */
export function subscribeToAllUserLocations(
  onUpdate: (locations: UserLocationWithId[]) => void
): Unsubscribe {
  const ref = collection(db, COLLECTIONS.USER_LOCATIONS);
  return onSnapshot(
    ref,
    (snap) => {
      const list: UserLocationWithId[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UserLocationWithId[];
      onUpdate(list);
    },
    () => onUpdate([])
  );
}

/** Update the user's location in Firestore (real-time store). Call when location is obtained or changes. */
export async function setUserLocation(
  userId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  if (!userId) return;
  const ref = doc(db, COLLECTIONS.USER_LOCATIONS, userId);
  await setDoc(ref, {
    userId,
    latitude,
    longitude,
    updatedAt: new Date().toISOString(),
  } as UserLocationDoc);
}

/** Subscribe to a user's location updates in real time. Returns unsubscribe function. */
export function subscribeToUserLocation(
  userId: string,
  onUpdate: (data: UserLocationDoc | null) => void
): Unsubscribe {
  if (!userId) {
    onUpdate(null);
    return () => {};
  }
  const ref = doc(db, COLLECTIONS.USER_LOCATIONS, userId);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserLocationDoc);
      } else {
        onUpdate(null);
      }
    },
    () => onUpdate(null)
  );
}
