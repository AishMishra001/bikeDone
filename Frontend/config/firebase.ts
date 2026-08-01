import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase Project Web Configuration from Firebase Console
// or set environment variables in .env (e.g., EXPO_PUBLIC_FIREBASE_API_KEY)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBLZ0ybNppY-B3Kpu2xUKT5TFIvEa2kNRM",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "bike-done.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "bike-done",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "bike-done.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "734016163328",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:734016163328:web:c9e973da597b15db6212e5",
  measurementId: "G-KH7N7NKKHF"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Set to false so Firebase sends REAL SMS to real mobile numbers
try {
  auth.settings.appVerificationDisabledForTesting = false;
} catch (e) {
  console.warn('Could not set appVerificationDisabledForTesting:', e);
}

export default app;
