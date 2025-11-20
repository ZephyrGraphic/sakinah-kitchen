import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { app } from "@/lib/firebase";

// Initialize Firebase services (only in browser)
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined" && app) {
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };

