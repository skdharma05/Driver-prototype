import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Fetch all loads from the Firestore `loads` collection.
 * Returns null if Firebase isn't configured (so callers can fall back to
 * local dummy data). Throws on a real network/permission error.
 */
export async function fetchAllLoads() {
  if (!db) return null;
  const snap = await getDocs(collection(db, 'loads'));
  return snap.docs.map((d) => ({ ...d.data(), loadId: d.data().loadId || d.id }));
}

/**
 * Fetch a single load by its loadId (the Firestore document ID).
 * Returns null if Firebase isn't configured or the load doesn't exist.
 */
export async function fetchLoadById(loadId) {
  if (!db || !loadId) return null;
  const snap = await getDoc(doc(db, 'loads', loadId));
  return snap.exists() ? { ...snap.data(), loadId: snap.id } : null;
}
