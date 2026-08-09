import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase Project Web Configuration from Firebase Console
// or set environment variables in .env (e.g., EXPO_PUBLIC_FIREBASE_API_KEY)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// On localhost (web dev), disable reCAPTCHA to avoid CSP errors from browser extensions.
// This sends real SMS but skips the invisible reCAPTCHA iframe.
// Set to false before production build.
try {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  auth.settings.appVerificationDisabledForTesting = isLocalhost;
} catch (e) {
  console.warn('Could not set appVerificationDisabledForTesting:', e);
}

export default app;
