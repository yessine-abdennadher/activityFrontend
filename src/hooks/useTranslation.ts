import { useCallback } from 'react';
import { i18n, type TranslationKey } from '../constants/translations';
import { useAppPreferences } from '../context/AppPreferencesContext';

export function useTranslation() {
  const { language } = useAppPreferences();
  const t = useCallback((key: TranslationKey) => i18n.t(key, { locale: language }), [language]);
  return { t, language };
}
