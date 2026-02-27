import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth as getFirebaseAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore as getFirebaseFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let _auth: Auth;
let _db: Firestore;

export function initFirebase(): FirebaseApp {
  if (app) return app;
  app = initializeApp(firebaseConfig);
  _auth = getFirebaseAuth(app);
  _db = getFirebaseFirestore(app);
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
    connectAuthEmulator(_auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(_db, "127.0.0.1", 8080);
  }
  return app;
}

export function getAuth(): Auth {
  if (!_auth) throw new Error("Firebase not initialized. Call initFirebase() first.");
  return _auth;
}

export function getFirestore(): Firestore {
  if (!_db) throw new Error("Firebase not initialized. Call initFirebase() first.");
  return _db;
}
