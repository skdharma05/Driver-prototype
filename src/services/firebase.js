import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getRemoteConfig } from "firebase/remote-config";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Values come from .env (EXPO_PUBLIC_* vars are inlined at build time).
// Copy .env.example → .env and fill in the values from the Firebase Console:
// Project Settings → General → Your apps → SDK setup and configuration.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.appId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;
let rtdb = null;
let storage = null;
let remoteConfig = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);

  // Firestore + Storage FIRST — these are what the app reads. An auth-init
  // problem must never prevent the database from initializing (otherwise db
  // stays null and every screen silently falls back to dummy data).
  const firestoreDbId = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_ID;
  db = firestoreDbId ? getFirestore(app, firestoreDbId) : getFirestore(app);
  storage = getStorage(app);

  // Auth with AsyncStorage persistence when available. `getReactNativePersistence`
  // was removed from `firebase/auth`'s exports in v12 for some build targets, so
  // guard it and fall back to default persistence rather than crashing.
  try {
    if (typeof getReactNativePersistence === 'function') {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } else {
      console.warn('[firebase] getReactNativePersistence unavailable — auth will not persist across restarts.');
      auth = getAuth(app);
    }
  } catch (e) {
    console.warn('[firebase] initializeAuth failed, falling back to getAuth:', e?.message);
    try { auth = getAuth(app); } catch (_) { auth = null; }
  }

  console.log(`[firebase] initialized ✓ project=${firebaseConfig.projectId} db=${firestoreDbId || '(default)'}`);

  // Realtime Database: only init if a databaseURL is configured.
  // getDatabase() throws synchronously without one.
  if (firebaseConfig.databaseURL) {
    rtdb = getDatabase(app);
  }

  // Remote Config in the Firebase JS SDK is web-only and throws in
  // React Native. Guard it so it can't crash app startup.
  try {
    remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
    remoteConfig.defaultConfig = {
      "kkp_support_phone": "+919000000000",
      "kkp_whatsapp_phone": "+919000000000"
    };
  } catch (e) {
    console.warn('[firebase] Remote Config unavailable in this environment:', e?.message);
  }
} else {
  console.warn(
    '[firebase] Skipping initialization — credentials missing. ' +
    'Copy .env.example to .env and fill in the EXPO_PUBLIC_FIREBASE_* values, ' +
    'then restart the dev server with `npx expo start -c`.'
  );
}

export { auth, db, rtdb, storage, remoteConfig };
export default app;
