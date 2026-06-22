// One-time seed: uploads src/constants/dummyLoads.js into the Firestore
// `loads` collection so the app has real data to fetch.
//
// Run from the project root:   node scripts/seedLoads.mjs
//
// Requires: .env filled with EXPO_PUBLIC_FIREBASE_* values, and Firestore
// rules that allow writes (test mode). Safe to re-run — it overwrites by loadId.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { DUMMY_LOADS } from '../src/constants/dummyLoads.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- read .env (no dotenv dependency) ---
const env = {};
for (const line of readFileSync(join(__dirname, '..', '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !line.trim().startsWith('#')) env[m[1]] = m[2];
}

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('✗ Missing Firebase config. Fill in .env first.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const dbId = env.EXPO_PUBLIC_FIREBASE_DATABASE_ID;
const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

console.log(
  `Seeding ${DUMMY_LOADS.length} loads into project "${firebaseConfig.projectId}"` +
  ` (database: ${dbId || '(default)'})...`
);

let n = 0;
for (const load of DUMMY_LOADS) {
  // Add a normalized city name for efficient querying later.
  const pickupCityName = (load.pickupCity || '').split(',')[0].trim();
  await setDoc(doc(db, 'loads', load.loadId), { ...load, pickupCityName });
  n++;
  console.log(`  ✓ ${load.loadId}  ${load.pickupCity} → ${load.dropCity}`);
}

console.log(`\nDone. Seeded ${n} loads into the "loads" collection.`);
process.exit(0);
