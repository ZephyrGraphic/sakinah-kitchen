// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgyUCNe-b8VFNeUqMJ3y9m7gqBR5OCarw",
  authDomain: "sakinah-kitchen.firebaseapp.com",
  projectId: "sakinah-kitchen",
  storageBucket: "sakinah-kitchen.firebasestorage.app",
  messagingSenderId: "290053078912",
  appId: "1:290053078912:web:9e15a5a85ed7512cda0b65",
  measurementId: "G-74N2C8VCX1"
};

// Initialize Firebase only in browser environment
let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;

if (typeof window !== "undefined") {
  // Only initialize in browser
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  
  // Initialize Analytics only in browser environment
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    // Analytics might fail if already initialized
    console.warn("Analytics initialization failed:", error);
  }
}

export { app, analytics };

