import React, { createContext, useContext, useState, useMemo } from 'react';
import { lightTheme, darkTheme, ThemeColors } from '../theme/theme';
import { translations, Language, TranslationKey } from '../constants/translations';

import { Storage, STORAGE_KEYS } from '../services/storage';
import { fetchSystemStatus } from '../services/activityService';

export type { Language } from '../constants/translations';

interface PreferencesContextType {
  mode: 'light' | 'dark';
  isDark: boolean;
  theme: ThemeColors;
  language: Language;
  electricityAlertActive: boolean;
  toggleDarkMode: () => void;
  setLanguage: (lang: Language) => void;
  setElectricityAlertActive: (active: boolean) => void;
  refreshElectricityAlert: () => Promise<void>;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [language, setLanguageState] = useState<Language>('ar');
  const [electricityAlertActive, setElectricityAlertActive] = useState<boolean>(false);

  // Synchronisation du statut global électricité
  const refreshElectricityAlert = React.useCallback(async () => {
    try {
      const res = await fetchSystemStatus();
      setElectricityAlertActive(res.electricityAlertActive);
    } catch {
      // Ignorer si offline
    }
  }, []);

  // Restauration des préférences au démarrage
  React.useEffect(() => {
    Storage.getItem(STORAGE_KEYS.THEME_MODE).then((savedMode) => {
      if (savedMode === 'light' || savedMode === 'dark') {
        setMode(savedMode);
      }
    });
    Storage.getItem(STORAGE_KEYS.LANGUAGE).then((savedLang) => {
      if (savedLang === 'ar' || savedLang === 'fr' || savedLang === 'en') {
        setLanguageState(savedLang as Language);
      }
    });
    refreshElectricityAlert();
  }, [refreshElectricityAlert]);

  const toggleDarkMode = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      Storage.setItem(STORAGE_KEYS.THEME_MODE, next);
      return next;
    });
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    Storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['ar'][key] || key;
  };

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      theme,
      language,
      electricityAlertActive,
      toggleDarkMode,
      setLanguage,
      setElectricityAlertActive,
      refreshElectricityAlert,
      t,
    }),
    [mode, theme, language, electricityAlertActive, refreshElectricityAlert]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within AppPreferencesProvider');
  }
  return context;
}

export function useAppPreferences() {
  return usePreferences();
}
