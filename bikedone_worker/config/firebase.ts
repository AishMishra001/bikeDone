import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

if (typeof window !== 'undefined' && window.location) {
  try {
    const hostname = window.location.hostname || '';
    const isLocalhost =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    auth.settings.appVerificationDisabledForTesting = isLocalhost;
  } catch (e) {
    console.warn('Could not set appVerificationDisabledForTesting:', e);
  }
}

export default app;
