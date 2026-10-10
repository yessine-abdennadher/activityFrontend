import ar from '../locales/ar.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

export type Language = 'ar' | 'fr' | 'en';

type LocaleFile = typeof ar;

/**
 * The JSON locale files are the single source of truth.
 * The aliases keep compatibility with the first MVP screens while they are
 * progressively migrated to the shared vocabulary.
 */
function createMessages(locale: LocaleFile) {
  return {
    ...locale,
    appTitle: 'ActivityTN',
    heroQuestion: locale.greeting,
    heroSub: locale.subtitle,
    searchPlaceholder: locale.searchPlaceholder,
    whatToDo: locale.categories,
    seeAll: locale.explore,
    nearbyActivities: locale.nearby,
    exploreTitle: locale.explore,
    notificationsTitle: locale.notifications,
    profileTitle: locale.profileTitle,
    tabHome: locale.home,
    tabExplore: locale.explore,
    tabFavorites: locale.favorites,
    tabProfile: locale.profile,
  };
}

export const translations = {
  ar: createMessages(ar),
  fr: createMessages(fr),
  en: createMessages(en),
};

export type TranslationKey = keyof typeof translations.ar;

export const i18n = {
  t(key: TranslationKey, options?: { locale?: Language }) {
    const locale = options?.locale ?? 'ar';
    return translations[locale][key] ?? translations.ar[key] ?? key;
  },
};
