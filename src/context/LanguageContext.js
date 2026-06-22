import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

const STORAGE_KEY = 'appLanguage';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  // Load the saved language preference on startup
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && translations[saved]) setLanguageState(saved);
      } catch (_e) {}
    })();
  }, []);

  const setLanguage = async (code) => {
    if (!translations[code]) return;
    setLanguageState(code);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch (_e) {}
  };

  // Translate a key, filling in {placeholders} from params.
  // Falls back to English, then to the raw key.
  const t = (key, params) => {
    const dict = translations[language] || translations.en;
    let str = dict[key] ?? translations.en[key] ?? key;
    if (params) {
      Object.keys(params).forEach((p) => {
        str = str.split(`{${p}}`).join(String(params[p]));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
