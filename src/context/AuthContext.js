import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

const PROFILE_CACHE_KEY = 'driver_profile_cache';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load cached profile on mount
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
        if (cached) {
          setDriverProfile(JSON.parse(cached));
        }
      } catch (e) {
        console.log('Error loading cache:', e);
      }
    };
    loadCache();
  }, []);

  useEffect(() => {
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
        setUser(null);
        // Keep driverProfile for demo purposes even if logged out
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
      
      if (user) {
        await setDoc(doc(db, 'drivers', user.uid), updatedData, { merge: true });
      }
    } catch (e) {
      console.error('Update profile error:', e);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
      setDriverProfile(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, driverProfile, loading, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
