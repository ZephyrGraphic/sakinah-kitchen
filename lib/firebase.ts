// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };

