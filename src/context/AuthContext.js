import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

const PROFILE_CACHE_KEY = 'driver_profile_cache';
const DUMMY_USER_KEY = 'dummy_user';
const LOGGED_OUT_FLAG = 'dummy_logged_out';

// ⚠️ DEMO MODE — auto-login enabled in release builds too.
// Set back to `__DEV__ && true` (or false) before a real public release.
const DEV_AUTO_LOGIN = true;

const DEV_DUMMY_USER = {
  uid: 'dev_solo_123',
  phoneNumber: '+917904248094',
  isDummy: true,
};

const DEV_DUMMY_PROFILE = {
  fullName: 'Dev Driver',
  phone: '+917904248094',
  userType: 'SOLO_DRIVER',
  vehicles: [{ vehicleType: '16-ft Open Truck', vehicleRegNo: 'TN01AB1234' }],
  homeCity: 'Chennai',
  homeState: 'TN',
  upiId: '7904248094@ybl',
  isProfileComplete: true,
  status: 'VERIFIED',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load cached session on mount (and auto-login in dev)
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [[, cachedUser], [, cachedProfile], [, loggedOut]] =
          await AsyncStorage.multiGet([
            DUMMY_USER_KEY,
            PROFILE_CACHE_KEY,
            LOGGED_OUT_FLAG,
          ]);

        if (cachedUser) setUser(JSON.parse(cachedUser));
        if (cachedProfile) setDriverProfile(JSON.parse(cachedProfile));

        // Auto-login in dev if there's no cached user AND user hasn't pressed logout
        if (DEV_AUTO_LOGIN && !cachedUser && !loggedOut) {
          setUser(DEV_DUMMY_USER);
          setDriverProfile(DEV_DUMMY_PROFILE);
          await AsyncStorage.multiSet([
            [DUMMY_USER_KEY, JSON.stringify(DEV_DUMMY_USER)],
            [PROFILE_CACHE_KEY, JSON.stringify(DEV_DUMMY_PROFILE)],
          ]);
        }
      } catch (e) {
        console.log('Bootstrap error:', e);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    // Skip Firebase listeners entirely if Firebase isn't configured
    // (placeholder API keys → auth/db are null → calling onAuthStateChanged crashes the app).
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile;

    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timer);
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);

        const docRef = doc(db, 'drivers', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDriverProfile(data);
            await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
          }
        }, (error) => {
          console.log("Firestore error (expected in demo):", error);
        });
      } else {
        // Don't wipe a cached dummy session when Firebase reports null
        const cached = await AsyncStorage.getItem(DUMMY_USER_KEY);
        if (!cached) setUser(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const updateProfile = async (data) => {
    try {
      const updatedData = { ...driverProfile, ...data };
      setDriverProfile(updatedData);
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(updatedData));
      
      if (user && db && !user.isDummy) {
        // Use a server Timestamp for the Firestore copy (sortable/range-queryable).
        // The local state/cache keeps the ISO string the UI reads.
        await setDoc(
          doc(db, 'drivers', user.uid),
          { ...updatedData, updatedAt: serverTimestamp() },
          { merge: true }
        );
      }
    } catch (e) {
      console.error('Update profile error:', e);
    }
  };

  const logout = async () => {
    try {
      if (auth) await auth.signOut();
      await AsyncStorage.multiRemove([PROFILE_CACHE_KEY, DUMMY_USER_KEY]);
      // Block dev auto-login until next manual login or app reinstall
      await AsyncStorage.setItem(LOGGED_OUT_FLAG, '1');
      setUser(null);
      setDriverProfile(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const loginAsDummy = async (dummyUser, dummyProfile) => {
    try {
      setUser(dummyUser);
      setDriverProfile(dummyProfile);
      await AsyncStorage.multiSet([
        [DUMMY_USER_KEY, JSON.stringify(dummyUser)],
        [PROFILE_CACHE_KEY, JSON.stringify(dummyProfile)],
      ]);
      await AsyncStorage.removeItem(LOGGED_OUT_FLAG);
    } catch (e) {
      console.error('Login as dummy error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, driverProfile, loading, logout, updateProfile, loginAsDummy }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
