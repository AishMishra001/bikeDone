import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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
