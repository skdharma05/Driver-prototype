import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Firebase config once created
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "kkp-logistics.firebaseapp.com",
  projectId: "kkp-logistics",
  storageBucket: "kkp-logistics.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://kkp-logistics-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

// Setup remote config
export const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
remoteConfig.defaultConfig = {
  "kkp_support_phone": "+919000000000",
  "kkp_whatsapp_phone": "+919000000000"
};

// fetchAndActivate(remoteConfig).catch((err) => console.log('Remote config fetch failed:', err));

export default app;
