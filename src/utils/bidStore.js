/**
 * bidStore.js — Local bid persistence layer (AsyncStorage)
 * Replace with real API calls when backend is ready.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIDS_KEY = 'driver_bids';

/** Load all bids from storage */
export const getBids = async () => {
  try {
    const raw = await AsyncStorage.getItem(BIDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/** Save a new bid to storage */
export const saveBid = async (bid) => {
  try {
    const existing = await getBids();
    // Avoid duplicates on same loadId
    const filtered = existing.filter(b => b.loadId !== bid.loadId);
    const updated = [bid, ...filtered];
    await AsyncStorage.setItem(BIDS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    throw new Error('Could not save bid');
  }
};

/** Clear all bids (for testing) */
export const clearBids = async () => {
  await AsyncStorage.removeItem(BIDS_KEY);
};
