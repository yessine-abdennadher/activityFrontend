import React, { createContext, useContext, useState, useMemo } from 'react';
import { getAppTheme, ThemeColors } from '../theme/theme';
import { APP_PALETTES, type PaletteId } from '../theme/palettes';
import { translations, Language, TranslationKey } from '../constants/translations';
import { Storage, STORAGE_KEYS } from '../services/storage';
import { fetchSystemStatus } from '../services/activityService';

export type { Language } from '../constants/translations';
export type { PaletteId } from '../theme/palettes';

interface PreferencesContextType {
  mode: 'light' | 'dark';
  isDark: boolean;
  theme: ThemeColors;
  palette: PaletteId;
  language: Language;
  electricityAlertActive: boolean;
  toggleDarkMode: () => void;
  setPalette: (paletteId: PaletteId) => void;
  setLanguage: (lang: Language) => void;
  setElectricityAlertActive: (active: boolean) => void;
  refreshElectricityAlert: () => Promise<void>;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [palette, setPaletteState] = useState<PaletteId>('win_original');
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
    Storage.getItem(STORAGE_KEYS.THEME_PALETTE).then((savedPalette) => {
      if (savedPalette && APP_PALETTES.some((p) => p.id === savedPalette)) {
        setPaletteState(savedPalette as PaletteId);
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

  const setPalette = (newPalette: PaletteId) => {
    setPaletteState(newPalette);
    Storage.setItem(STORAGE_KEYS.THEME_PALETTE, newPalette);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    Storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  // Calcul dynamique du thème selon le mode (clair/sombre) et la palette de couleur
  const theme = useMemo(() => getAppTheme(mode, palette), [mode, palette]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['ar'][key] || key;
  };

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      theme,
      palette,
      language,
      electricityAlertActive,
      toggleDarkMode,
      setPalette,
      setLanguage,
      setElectricityAlertActive,
      refreshElectricityAlert,
      t,
    }),
    [mode, theme, palette, language, electricityAlertActive, refreshElectricityAlert]
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

export const useAppPreferences = usePreferences;
