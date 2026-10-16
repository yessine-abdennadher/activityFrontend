/**
 * activityService.ts
 * Service de gestion des activités avec authentification JWT Bearer Token.
 * En cas d'échec réseau, repli gracieux sur les données locales (mockData).
 */

import { getApiBaseUrl, getFallbackApiUrls, setApiBaseUrl } from './apiConfig';
import { getAuthToken, refreshAccessToken } from './authService';
import type { Activity, Category } from '../types';
import { CATEGORIES, LocalizedCategory, setDynamicCategories } from '../constants/categories';


// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Construit les headers HTTP avec le Bearer Token si disponible.
 */
function buildHeaders(requiresAuth = false): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requiresAuth) {
    throw new Error('Authentification requise. Veuillez vous connecter.');
  }
  return headers;
}

/**
 * Requête HTTP générique avec basculement automatique d'hôte et gestion de l'expiration du token.
 */
async function apiFetch(
  path: string,
  options: RequestInit = {},
  requiresAuth = false
): Promise<Response> {
  const headers = buildHeaders(requiresAuth);
  let activeBaseUrl = getApiBaseUrl();

  // Essayer d'abord avec l'URL active connue
  try {
    const url = `${activeBaseUrl}${path}`;
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return fetch(url, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        });
      }
    }
    return response;
  } catch (err) {
    // Si la connexion a échoué (erreur réseau / hôte injoignable), tester les autres hôtes de secours
    const fallbacks = getFallbackApiUrls();
    for (const candidate of fallbacks) {
      if (candidate === activeBaseUrl) continue;
      try {
        const testUrl = `${candidate}${path}`;
        const res = await fetch(testUrl, { ...options, headers });
        if (res.ok || res.status < 500) {
          setApiBaseUrl(candidate);
          console.log(`[activityService] 🔄 Basculement réussi vers l'hôte opérationnel : ${candidate}`);
          return res;
        }
      } catch {
        // Continuer vers le candidat suivant
      }
    }
    throw err;
  }
}

/**
 * Mappe un objet activité backend vers le type Activity du frontend.
 */
function mapActivity(raw: Record<string, unknown>): Activity {
  const coords = (raw.coordinates as { latitude?: number; longitude?: number } | undefined) || {};
  const categoryIcons: Record<string, string> = {
    fun: '🎮',
    sport: '🏃',
    outdoor: '🌳',
    food: '🍔',
    creative: '🎨',
    couple: '❤️',
    friends: '👥',
  };

  const distKm = raw.distanceKm !== undefined ? Number(raw.distanceKm) : undefined;
  const distStr = (raw.distance as string) || (distKm !== undefined ? `${distKm} km` : '');
  const cat = (raw.category as string) || 'fun';

  return {
    id: (raw._id as string) || (raw.id as string),
    name: (raw.name as string) || '',
    nameAr: (raw.nameAr as string) || (raw.name as string),
    nameFr: (raw.nameFr as string) || (raw.name as string),
    nameEn: (raw.nameEn as string) || (raw.name as string),
    category: cat,
    categoryIcon: (raw.categoryIcon as string) || categoryIcons[cat] || '📍',
    city: (raw.city as string) || 'Sfax',
    cityAr: (raw.cityAr as string) || 'صفاقس',
    cityFr: (raw.cityFr as string) || 'Sfax',
    cityEn: (raw.cityEn as string) || 'Sfax',
    price: (raw.price as number) || 0,
    duration: (raw.duration as string) || (raw.durationMinutes ? `${raw.durationMinutes} min` : '1h'),
    distance: distStr,
    rating: (raw.reviewsCount && Number(raw.reviewsCount) > 0) ? Number(raw.rating || 0) : (raw.rating !== undefined && Number(raw.reviewsCount) !== 0 ? Number(raw.rating) : 0),
    image: (raw.image as string) || (raw.imageUrl as string) || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    description: (raw.description as string) || '',
    descriptionAr: (raw.descriptionAr as string) || (raw.description as string),
    descriptionFr: (raw.descriptionFr as string) || (raw.description as string),
    descriptionEn: (raw.descriptionEn as string) || (raw.description as string),
    location: (raw.location as string) || (raw.locationName as string) || (raw.address as string) || '',
    locationNameAr: (raw.locationNameAr as string) || (raw.locationName as string),
    locationNameFr: (raw.locationNameFr as string) || (raw.locationName as string),
    locationNameEn: (raw.locationNameEn as string) || (raw.locationName as string),
    latitude: raw.latitude !== undefined ? Number(raw.latitude) : coords.latitude,
    longitude: raw.longitude !== undefined ? Number(raw.longitude) : coords.longitude,
    priceTag: (raw.priceTag as string) || (raw.badge as string) || `${raw.price || 0} DT`,
    badgeAr: (raw.badgeAr as string) || (raw.badge as string),
    badgeFr: (raw.badgeFr as string) || (raw.badge as string),
    badgeEn: (raw.badgeEn as string) || (raw.badge as string),
    translations: (raw.translations as any) || undefined,
    averagePrice: raw.averagePrice !== undefined ? Number(raw.averagePrice) : (raw.price as number),
    priceRange: (raw.priceRange as string) || `${raw.price || 0} DT`,
    priceLevel: (raw.priceLevel as Activity['priceLevel']) || '$$',
    durationMinutes: raw.durationMinutes !== undefined ? Number(raw.durationMinutes) : 60,
    distanceKm: distKm || 3.0,
    reviewsCount: raw.reviewsCount !== undefined ? Number(raw.reviewsCount) : 10,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : ['نشاط'],
    suitableFor: Array.isArray(raw.suitableFor) ? (raw.suitableFor as string[]) : ['صحاب', 'عائلة'],
    isFavorite: Boolean(raw.isFavorite),
    isFeatured: Boolean(raw.isFeatured || raw.isPopular),
    isIndoor: raw.isIndoor !== undefined ? Boolean(raw.isIndoor) : false,
    bookingRequired: raw.bookingRequired !== undefined ? Boolean(raw.bookingRequired) : false,
    openingHours: (raw.openingHours as string) || '10:00 - 22:00',
    hasPowerBackup: raw.hasPowerBackup !== undefined ? Boolean(raw.hasPowerBackup) : true,
    hasAirConditioning: raw.hasAirConditioning !== undefined ? Boolean(raw.hasAirConditioning) : true,
    isOpenNow: raw.isOpenNow !== undefined ? Boolean(raw.isOpenNow) : true,
    phone: (raw.phone as string) || '+216 74 200 100',
    whatsapp: (raw.whatsapp as string) || (raw.phone as string) || '+216 98 200 100',
    events: Array.isArray(raw.events) ? (raw.events as any) : undefined,
    promotion: raw.promotion ? (raw.promotion as any) : undefined,
  };
}

// ─────────────────────────────────────────────
// API Publiques (GET — pas de token obligatoire)
// ─────────────────────────────────────────────

export interface ActivityFilters {
  city?: string;
  category?: string;
  search?: string;
}

export const DEFAULT_SFAX_ACTIVITIES: Activity[] = [
  {
    id: 'sfax-mall-of-sfax',
    name: 'Mall of Sfax',
    nameAr: 'مول صفاقس',
    nameFr: 'Mall of Sfax',
    nameEn: 'Mall of Sfax',
    category: 'fun',
    categoryIcon: '🛍️',
    city: 'Sfax',
    cityAr: 'صفاقس',
    cityFr: 'Sfax',
    cityEn: 'Sfax',
    price: 15,
    duration: '2h - 4h',
    distance: '4.8 km',
    distanceKm: 4.8,
    rating: 4.9,
    reviewsCount: 480,
    image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=800&q=80',
    description: 'أكبر مركز تجاري وترفيهي في صفاقس! تجارب تسوق، مطاعم عالمية ومحلية، سينما، فضاء ألعاب بولينغ وترفيه عائلي متكامل.',
    descriptionAr: 'أكبر مركز تجاري وترفيهي في صفاقس! تجارب تسوق، مطاعم عالمية ومحلية، سينما، فضاء ألعاب بولينغ وترفيه عائلي متكامل.',
    descriptionFr: 'Le plus grand centre commercial et de loisirs à Sfax ! Boutiques internationales, food court, cinéma Pathé, bowling et loisirs familiaux complets.',
    descriptionEn: 'The premier shopping and entertainment center in Sfax! International retail, food court, Pathé cinema, bowling and family fun.',
    location: 'طريق تونس كم 9، ساقية الزيت، صفاقس',
    locationNameAr: 'طريق تونس كم 9، ساقية الزيت، صفاقس',
    locationNameFr: 'Route de Tunis Km 9, Sakiet Ezzit, Sfax',
    locationNameEn: 'Tunis Road Km 9, Sakiet Ezzit, Sfax',
    latitude: 34.7925,
    longitude: 10.7712,
    priceTag: 'من 15 د.ت',
    badgeAr: 'الأكثر شعبية',
    badgeFr: 'Populaire',
    badgeEn: 'Popular',
    averagePrice: 25,
    priceRange: '15 - 50 د.ت',
    priceLevel: '$$',
    durationMinutes: 180,
    tags: ['تسوق', 'ترفيه', 'سينما', 'مطاعم'],
    suitableFor: ['عائلة', 'صحاب', 'كوبل'],
    isFeatured: true,
    isIndoor: true,
    hasAirConditioning: true,
    hasPowerBackup: true,
    isOpenNow: true,
    openingHours: '09:00 - 23:00',
    translations: {
      ar: {
        name: 'مول صفاقس',
        description: 'أكبر مركز تجاري وترفيهي في صفاقس! تجارب تسوق، مطاعم عالمية ومحلية، سينما، فضاء ألعاب بولينغ وترفيه عائلي متكامل.',
        locationName: 'طريق تونس كم 9، ساقية الزيت، صفاقس',
        city: 'صفاقس',
        badge: 'الأكثر شعبية',
      },
      fr: {
        name: 'Mall of Sfax',
        description: 'Le plus grand centre commercial et de loisirs à Sfax ! Boutiques internationales, food court, cinéma Pathé, bowling et loisirs familiaux complets.',
        locationName: 'Route de Tunis Km 9, Sakiet Ezzit, Sfax',
        city: 'Sfax',
        badge: 'Populaire',
      },
      en: {
        name: 'Mall of Sfax',
        description: 'The premier shopping and entertainment center in Sfax! International retail, food court, Pathé cinema, bowling and family fun.',
        locationName: 'Tunis Road Km 9, Sakiet Ezzit, Sfax',
        city: 'Sfax',
        badge: 'Popular',
      },
    },
  },
  {
    id: 'sfax-dar-zmen',
    name: 'دار زمان - Dar Zmen',
    nameAr: 'دار زمان',
    nameFr: 'Dar Zmen',
    nameEn: 'Dar Zmen Heritage Cafe',
    category: 'food',
    categoryIcon: '☕',
    city: 'Sfax',
    cityAr: 'صفاقس',
    cityFr: 'Sfax',
    cityEn: 'Sfax',
    price: 12,
    duration: '1h - 2h',
    distance: '1.6 km',
    distanceKm: 1.6,
    rating: 4.8,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    description: 'أجواء تونسية أصيلة وديكور تراثي ساحر بقلب صفاقس. قهوة عربي بالزهر، شاي باللوز، حلويات صفاقسية تقليدية، وشيشة في قعدة هادئة.',
    descriptionAr: 'أجواء تونسية أصيلة وديكور تراثي ساحر بقلب صفاقس. قهوة عربي بالزهر، شاي باللوز، حلويات صفاقسية تقليدية، وشيشة في قعدة هادئة.',
    descriptionFr: 'Ambiance tunisienne authentique et décor traditionnel au cœur de Sfax. Café turc à la fleur d\'oranger, thé aux amandes, pâtisseries sfaxiennes et chicha.',
    descriptionEn: 'Authentic Tunisian heritage lounge in the heart of Sfax. Traditional Arabic coffee, almond tea, authentic Sfaxian sweets, and relaxing shisha.',
    location: 'طريق تنيور كم 1.5، بيكفيل، صفاقس',
    locationNameAr: 'طريق تنيور كم 1.5، بيكفيل، صفاقس',
    locationNameFr: 'Route Téniour Km 1.5, Picville, Sfax',
    locationNameEn: 'Teniour Road Km 1.5, Picville, Sfax',
    latitude: 34.7523,
    longitude: 10.7485,
    priceTag: '12 د.ت',
    badgeAr: 'تراث وأصالة',
    badgeFr: 'Traditionnel',
    badgeEn: 'Heritage',
    averagePrice: 15,
    priceRange: '8 - 20 د.ت',
    priceLevel: '$',
    durationMinutes: 90,
    tags: ['تراث', 'شاي باللوز', 'قهوة عربي', 'شيشة', 'هدوء'],
    suitableFor: ['صحاب', 'عائلة', 'كوبل'],
    isFeatured: true,
    isIndoor: true,
    hasAirConditioning: true,
    hasPowerBackup: true,
    isOpenNow: true,
    openingHours: '08:00 - 00:00',
    translations: {
      ar: {
        name: 'دار زمان',
        description: 'أجواء تونسية أصيلة وديكور تراثي ساحر بقلب صفاقس. قهوة عربي بالزهر، شاي باللوز، حلويات صفاقسية تقليدية، وشيشة في قعدة هادئة.',
        locationName: 'طريق تنيور كم 1.5، بيكفيل، صفاقس',
        city: 'صفاقس',
        badge: 'تراث وأصالة',
      },
      fr: {
        name: 'Dar Zmen',
        description: 'Ambiance tunisienne authentique et décor traditionnel au cœur de Sfax. Café turc à la fleur d\'oranger, thé aux amandes, pâtisseries sfaxiennes et chicha.',
        locationName: 'Route Téniour Km 1.5, Picville, Sfax',
        city: 'Sfax',
        badge: 'Traditionnel',
      },
      en: {
        name: 'Dar Zmen Heritage Cafe',
        description: 'Authentic Tunisian heritage lounge in the heart of Sfax. Traditional Arabic coffee, almond tea, authentic Sfaxian sweets, and relaxing shisha.',
        locationName: 'Teniour Road Km 1.5, Picville, Sfax',
        city: 'Sfax',
        badge: 'Heritage',
      },
    },
  },
  {
    id: 'sfax-cafe-diwan',
    name: 'مقهى الديوان - أسوار المدينة العتيقة',
    nameAr: 'مقهى الديوان - أسوار المدينة العتيقة',
    nameFr: 'Café Diwan - Remparts de la Médina',
    nameEn: 'Cafe Diwan - Historic Medina Walls',
    category: 'food',
    categoryIcon: '🏰',
    city: 'Sfax',
    cityAr: 'صفاقس',
    cityFr: 'Sfax',
    cityEn: 'Sfax',
    price: 10,
    duration: '1h - 2h',
    distance: '0.9 km',
    distanceKm: 0.9,
    rating: 4.7,
    reviewsCount: 260,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    description: 'جلسة تراثية فوق أسوار المدينة العتيقة بصفاقس وإطلالة بانورامية ساحرة على باب الديوان وميناء صفاقس مع نسيم البحر.',
    descriptionAr: 'جلسة تراثية فوق أسوار المدينة العتيقة بصفاقس وإطلالة بانورامية ساحرة على باب الديوان وميناء صفاقس مع نسيم البحر.',
    descriptionFr: 'Terrasse panoramique perchée sur les remparts de la Médina de Sfax. Vue imprenable sur Bab Diwan et le port maritime avec brise marine.',
    descriptionEn: 'Panoramic historic rooftop set atop the ancient Medina ramparts of Sfax. Breathtaking view overlooking Bab Diwan square and the sea port.',
    location: 'باب الديوان، المدينة العتيقة، صفاقس',
    locationNameAr: 'باب الديوان، المدينة العتيقة، صفاقس',
    locationNameFr: 'Bab Diwan, Médina de Sfax',
    locationNameEn: 'Bab Diwan, Sfax Medina',
    latitude: 34.7358,
    longitude: 10.7612,
    priceTag: '10 د.ت',
    badgeAr: 'إطلالة بحر',
    badgeFr: 'Vue Mer',
    badgeEn: 'Sea View',
    averagePrice: 12,
    priceRange: '6 - 18 د.ت',
    priceLevel: '$',
    durationMinutes: 75,
    tags: ['تاريخي', 'إطلالة بحر', 'المدينة العتيقة', 'شاي'],
    suitableFor: ['صحاب', 'كوبل'],
    isFeatured: true,
    isIndoor: false,
    hasAirConditioning: false,
    hasPowerBackup: true,
    isOpenNow: true,
    openingHours: '08:30 - 23:30',
    translations: {
      ar: {
        name: 'مقهى الديوان - أسوار المدينة العتيقة',
        description: 'جلسة تراثية فوق أسوار المدينة العتيقة بصفاقس وإطلالة بانورامية ساحرة على باب الديوان وميناء صفاقس مع نسيم البحر.',
        locationName: 'باب الديوان، المدينة العتيقة، صفاقس',
        city: 'صفاقس',
        badge: 'إطلالة بحر',
      },
      fr: {
        name: 'Café Diwan - Remparts de la Médina',
        description: 'Terrasse panoramique perchée sur les remparts de la Médina de Sfax. Vue imprenable sur Bab Diwan et le port maritime avec brise marine.',
        locationName: 'Bab Diwan, Médina de Sfax',
        city: 'Sfax',
        badge: 'Vue Mer',
      },
      en: {
        name: 'Cafe Diwan - Historic Medina Walls',
        description: 'Panoramic historic rooftop set atop the ancient Medina ramparts of Sfax. Breathtaking view overlooking Bab Diwan square and the sea port.',
        locationName: 'Bab Diwan, Sfax Medina',
        city: 'Sfax',
        badge: 'Sea View',
      },
    },
  },
  {
    id: 'sfax-escape-room',
    name: 'Escape Room Sfax',
    nameAr: 'غرفة الهروب صفاقس',
    nameFr: 'Escape Room Sfax',
    nameEn: 'Escape Room Sfax',
    category: 'fun',
    categoryIcon: '🔐',
    city: 'Sfax',
    cityAr: 'صفاقس',
    cityFr: 'Sfax',
    cityEn: 'Sfax',
    price: 25,
    duration: '60 min',
    distance: '2.4 km',
    distanceKm: 2.4,
    rating: 4.8,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    description: 'تجربة فريدة من نوعها مع أصحابك! حل الألغاز واهرب من الغرفة المظلمة قبل ما يوفى الوقت. أنشطة مليئة بالتحدي والتسلية.',
    descriptionAr: 'تجربة فريدة من نوعها مع أصحابك! حل الألغاز واهرب من الغرفة المظلمة قبل ما يوفى الوقت. أنشطة مليئة بالتحدي والتسلية.',
    descriptionFr: 'Une expérience d\'immersion palpitante entre amis ! Résolvez les énigmes et évadez-vous en moins de 60 minutes avec adrénaline garantie.',
    descriptionEn: 'Thrilling real-life room escape game with your friends! Solve puzzles, crack clues, and beat the 60-minute countdown.',
    location: 'طريق الأفران كم 3، صفاقس',
    locationNameAr: 'طريق الأفران كم 3، صفاقس',
    locationNameFr: 'Route Afrane Km 3, Sfax',
    locationNameEn: 'Afrane Road Km 3, Sfax',
    latitude: 34.7340,
    longitude: 10.7320,
    priceTag: '25 د.ت',
    badgeAr: 'مغامرة وتحدي',
    badgeFr: 'Défi d\'équipe',
    badgeEn: 'Team Challenge',
    averagePrice: 25,
    priceRange: '25 د.ت',
    priceLevel: '$$',
    durationMinutes: 60,
    tags: ['تحدي', 'ألغاز', 'فريق', 'مغامرة'],
    suitableFor: ['صحاب', 'فرق عمل'],
    isFeatured: true,
    isIndoor: true,
    hasAirConditioning: true,
    hasPowerBackup: true,
    isOpenNow: true,
    openingHours: '14:00 - 23:00',
    translations: {
      ar: {
        name: 'غرفة الهروب صفاقس',
        description: 'تجربة فريدة من نوعها مع أصحابك! حل الألغاز واهرب من الغرفة المظلمة قبل ما يوفى الوقت. أنشطة مليئة بالتحدي والتسلية.',
        locationName: 'طريق الأفران كم 3، صفاقس',
        city: 'صفاقس',
        badge: 'مغامرة وتحدي',
      },
      fr: {
        name: 'Escape Room Sfax',
        description: 'Une expérience d\'immersion palpitante entre amis ! Résolvez les énigmes et évadez-vous en moins de 60 minutes avec adrénaline garantie.',
        locationName: 'Route Afrane Km 3, Sfax',
        city: 'Sfax',
        badge: 'Défi d\'équipe',
      },
      en: {
        name: 'Escape Room Sfax',
        description: 'Thrilling real-life room escape game with your friends! Solve puzzles, crack clues, and beat the 60-minute countdown.',
        locationName: 'Afrane Road Km 3, Sfax',
        city: 'Sfax',
        badge: 'Team Challenge',
      },
    },
  },
  {
    id: 'sfax-bowling-mall',
    name: 'Bowling & Loisirs Mall of Sfax',
    nameAr: 'بولينغ وألعاب مول صفاقس',
    nameFr: 'Bowling & Loisirs Mall of Sfax',
    nameEn: 'Bowling & Arcade Mall of Sfax',
    category: 'fun',
    categoryIcon: '🎳',
    city: 'Sfax',
    cityAr: 'صفاقس',
    cityFr: 'Sfax',
    cityEn: 'Sfax',
    price: 18,
    duration: '1h - 2h',
    distance: '4.9 km',
    distanceKm: 4.9,
    rating: 4.8,
    reviewsCount: 195,
    image: 'https://images.unsplash.com/photo-1538388149866-71294d1f0b54?auto=format&fit=crop&w=800&q=80',
    description: 'مسارات بولينغ عصرية، بلياردو، وألعاب أركيد تفاعلية لقضاء أحلى الأوقات التنافسية مع أصحابك وعائلتك داخل مول أوف صفاقس.',
    descriptionAr: 'مسارات بولينغ عصرية، بلياردو، وألعاب أركيد تفاعلية لقضاء أحلى الأوقات التنافسية مع أصحابك وعائلتك داخل مول أوف صفاقس.',
    descriptionFr: 'Pistes de bowling dernier cri, billard et jeux d\'arcade interactifs pour une soirée festive et compétitive au Mall of Sfax.',
    descriptionEn: 'State-of-the-art bowling lanes, pool tables, and modern interactive arcade games for high-energy fun inside Mall of Sfax.',
    location: 'مول أوف صفاقس، طريق تونس كم 9',
    locationNameAr: 'مول أوف صفاقس، طريق تونس كم 9',
    locationNameFr: 'Mall of Sfax, Route de Tunis Km 9, Sakiet Ezzit',
    locationNameEn: 'Mall of Sfax, Tunis Road Km 9, Sakiet Ezzit',
    latitude: 34.7932,
    longitude: 10.7716,
    priceTag: '18 د.ت',
    badgeAr: 'مرح وتحدي',
    badgeFr: 'Loisirs Fun',
    badgeEn: 'Arcade & Fun',
    averagePrice: 20,
    priceRange: '15 - 35 د.ت',
    priceLevel: '$$',
    durationMinutes: 90,
    tags: ['بولينغ', 'ألعاب', 'تحدي', 'أصدقاء'],
    suitableFor: ['صحاب', 'عائلة'],
    isFeatured: false,
    isIndoor: true,
    hasAirConditioning: true,
    hasPowerBackup: true,
    isOpenNow: true,
    openingHours: '10:00 - 23:30',
    translations: {
      ar: {
        name: 'بولينغ وألعاب مول صفاقس',
        description: 'مسارات بولينغ عصرية، بلياردو، وألعاب أركيد تفاعلية لقضاء أحلى الأوقات التنافسية مع أصحابك وعائلتك داخل مول أوف صفاقس.',
        locationName: 'مول أوف صفاقس، طريق تونس كم 9',
        city: 'صفاقس',
        badge: 'مرح وتحدي',
      },
      fr: {
        name: 'Bowling & Loisirs Mall of Sfax',
        description: 'Pistes de bowling dernier cri, billard et jeux d\'arcade interactifs pour une soirée festive et compétitive au Mall of Sfax.',
        locationName: 'Mall of Sfax, Route de Tunis Km 9, Sakiet Ezzit',
        city: 'Sfax',
        badge: 'Loisirs Fun',
      },
      en: {
        name: 'Bowling & Arcade Mall of Sfax',
        description: 'State-of-the-art bowling lanes, pool tables, and modern interactive arcade games for high-energy fun inside Mall of Sfax.',
        locationName: 'Mall of Sfax, Tunis Road Km 9, Sakiet Ezzit',
        city: 'Sfax',
        badge: 'Arcade & Fun',
      },
    },
  },
  {
    id: 'sfax-theatre-municipal',
    name: 'المسرح البلدي وباب بحر صفاقس',
    nameAr: 'المسرح البلدي وباب بحر صفاقس',
    nameFr: 'Théâtre Municipal & Bab Bhar Sfax',
    nameEn: 'Municipal Theatre & Bab Bhar Sfax',
    category: 'creative',
    categoryIcon: '🎭',
    city: 'Sfax',
    cityAr: 'صفاقس',
    cityFr: 'Sfax',
    cityEn: 'Sfax',
    price: 10,
    duration: '1h - 3h',
    distance: '0.6 km',
    distanceKm: 0.6,
    rating: 4.6,
    reviewsCount: 180,
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    description: 'قلب مدينة صفاقس التراثي والمعماري. حضور عروض مسرحية وموسيقية ومعارض فنية في صرح معماري تاريخي فريد.',
    descriptionAr: 'قلب مدينة صفاقس التراثي والمعماري. حضور عروض مسرحية وموسيقية ومعارض فنية في صرح معماري تاريخي فريد.',
    descriptionFr: 'Cœur architectural et culturel de Sfax. Spectacles théâtraux, concerts en direct et expositions artistiques au cœur de Bab Bhar.',
    descriptionEn: 'The cultural and architectural heart of Sfax. Theatrical performances, musical concerts, and art exhibits in a majestic historical landmark.',
    location: 'شارع الهادي شاكر، باب بحر، صفاقس',
    locationNameAr: 'شارع الهادي شاكر، باب بحر، صفاقس',
    locationNameFr: 'Avenue Hédi Chaker, Bab Bhar, Sfax',
    locationNameEn: 'Hedi Chaker Avenue, Bab Bhar, Sfax',
    latitude: 34.7397,
    longitude: 10.7632,
    priceTag: '10 د.ت',
    badgeAr: 'فن وثقافة',
    badgeFr: 'Culture & Art',
    badgeEn: 'Culture & Art',
    averagePrice: 15,
    priceRange: 'مجاني - 20 د.ت',
    priceLevel: '$',
    durationMinutes: 120,
    tags: ['مسرح', 'فن', 'ثقافة', 'وسط المدينة'],
    suitableFor: ['صحاب', 'عائلة', 'كوبل'],
    isFeatured: true,
    isIndoor: true,
    hasAirConditioning: true,
    hasPowerBackup: true,
    isOpenNow: true,
    openingHours: '09:00 - 22:00',
    translations: {
      ar: {
        name: 'المسرح البلدي وباب بحر صفاقس',
        description: 'قلب مدينة صفاقس التراثي والمعماري. حضور عروض مسرحية وموسيقية ومعارض فنية في صرح معماري تاريخي فريد.',
        locationName: 'شارع الهادي شاكر، باب بحر، صفاقس',
        city: 'صفاقس',
        badge: 'فن وثقافة',
      },
      fr: {
        name: 'Théâtre Municipal & Bab Bhar Sfax',
        description: 'Cœur architectural et culturel de Sfax. Spectacles théâtraux, concerts en direct et expositions artistiques au cœur de Bab Bhar.',
        locationName: 'Avenue Hédi Chaker, Bab Bhar, Sfax',
        city: 'Sfax',
        badge: 'Culture & Art',
      },
      en: {
        name: 'Municipal Theatre & Bab Bhar Sfax',
        description: 'The cultural and architectural heart of Sfax. Theatrical performances, musical concerts, and art exhibits in a majestic historical landmark.',
        locationName: 'Hedi Chaker Avenue, Bab Bhar, Sfax',
        city: 'Sfax',
        badge: 'Culture & Art',
      },
    },
  },
  {
    id: 'sfax-le-moulin',
    name: 'Le Moulin Cafe & Lounge',
    nameAr: 'لو مولان كافيه ولاونج',
    nameFr: 'Le Moulin Cafe & Lounge',
    nameEn: 'Le Moulin Cafe & Lounge',
    category: 'food',
    categoryIcon: '☕',
    city: 'Sfax',
    cityAr: 'صفاقس',
    cityFr: 'Sfax',
    cityEn: 'Sfax',
    price: 14,
    duration: '1h - 2h',
    distance: '2.1 km',
    distanceKm: 2.1,
    rating: 4.7,
    reviewsCount: 220,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    description: 'كافيه لاونج راقي، قهوة فاخرة، ساندويتشات وحلويات عصرية في ديكور هادئ ومريح للمذاكرة أو لقاء الأصحاب.',
    descriptionAr: 'كافيه لاونج راقي، قهوة فاخرة، ساندويتشات وحلويات عصرية في ديكور هادئ ومريح للمذاكرة أو لقاء الأصحاب.',
    descriptionFr: 'Lounge élégant et cosy avec café de spécialité, brunchs gourmands et ambiance musicale feutrée pour se retrouver entre amis.',
    descriptionEn: 'Chic modern lounge offering specialty coffee, delightful desserts, and light bites in a relaxing musical ambiance on Gremda Road.',
    location: 'طريق قرمدة كم 2، صفاقس',
    locationNameAr: 'طريق قرمدة كم 2، صفاقس',
    locationNameFr: 'Route Gremda Km 2, Sfax',
    locationNameEn: 'Gremda Road Km 2, Sfax',
    latitude: 34.7480,
    longitude: 10.7510,
    priceTag: '14 د.ت',
    badgeAr: 'أجواء عصرية',
    badgeFr: 'Lounge Cosy',
    badgeEn: 'Cozy Lounge',
    averagePrice: 18,
    priceRange: '10 - 25 د.ت',
    priceLevel: '$$',
    durationMinutes: 90,
    tags: ['لاونج', 'قهوة', 'موسيقى', 'لقاءات'],
    suitableFor: ['صحاب', 'كوبل'],
    isFeatured: false,
    isIndoor: true,
    hasAirConditioning: true,
    hasPowerBackup: true,
    isOpenNow: true,
    openingHours: '07:30 - 00:00',
    translations: {
      ar: {
        name: 'لو مولان كافيه ولاونج',
        description: 'كافيه لاونج راقي، قهوة فاخرة، ساندويتشات وحلويات عصرية في ديكور هادئ ومريح للمذاكرة أو لقاء الأصحاب.',
        locationName: 'طريق قرمدة كم 2، صفاقس',
        city: 'صفاقس',
        badge: 'أجواء عصرية',
      },
      fr: {
        name: 'Le Moulin Cafe & Lounge',
        description: 'Lounge élégant et cosy avec café de spécialité, brunchs gourmands et ambiance musicale feutrée pour se retrouver entre amis.',
        locationName: 'Route Gremda Km 2, Sfax',
        city: 'Sfax',
        badge: 'Lounge Cosy',
      },
      en: {
        name: 'Le Moulin Cafe & Lounge',
        description: 'Chic modern lounge offering specialty coffee, delightful desserts, and light bites in a relaxing musical ambiance on Gremda Road.',
        locationName: 'Gremda Road Km 2, Sfax',
        city: 'Sfax',
        badge: 'Cozy Lounge',
      },
    },
  },
  {
    id: 'sfax-plage-chaffar',
    name: 'شاطئ الشفار - Chaffar Beach',
    nameAr: 'شاطئ الشفار - صفاقس',
    nameFr: 'Plage de Chaffar Sfax',
    nameEn: 'Chaffar Beach Sfax',
    category: 'outdoor',
    categoryIcon: '🏖️',
    city: 'Sfax',
    cityAr: 'صفاقس',
    cityFr: 'Sfax',
    cityEn: 'Sfax',
    price: 0,
    duration: '2h - 5h',
    distance: '24.0 km',
    distanceKm: 24.0,
    rating: 4.6,
    reviewsCount: 390,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: 'الشاطئ الرملي الأجمل في ولاية صفاقس. مثالي للنزهات العائلية، السباحة، كرة الطائرة الشاطئية، والاستمتاع بغروب الشمس.',
    descriptionAr: 'الشاطئ الرملي الأجمل في ولاية صفاقس. مثالي للنزهات العائلية، السباحة، كرة الطائرة الشاطئية، والاستمتاع بغروب الشمس.',
    descriptionFr: 'La plus belle plage de sable fin de la région de Sfax. Idéale pour les baignades estivales, pique-niques en famille et couchers de soleil.',
    descriptionEn: 'The premier sandy coastline in the Sfax region. Perfect for family picnics, beach volleyball, relaxing swims, and stunning sunsets.',
    location: 'المحرس / الشفار، صفاقس الجنوبية',
    locationNameAr: 'المحرس / الشفار، صفاقس الجنوبية',
    locationNameFr: 'Plage Chaffar, Mahres, Sfax',
    locationNameEn: 'Chaffar Beach, Mahres, Sfax',
    latitude: 34.5422,
    longitude: 10.5833,
    priceTag: 'مجاني',
    badgeAr: 'دخول مجاني',
    badgeFr: 'Accès Gratuit',
    badgeEn: 'Free Access',
    averagePrice: 0,
    priceRange: 'مجاني',
    priceLevel: '$',
    durationMinutes: 240,
    tags: ['بحر', 'طبيعة', 'غروب', 'سباحة'],
    suitableFor: ['عائلة', 'صحاب'],
    isFeatured: false,
    isIndoor: false,
    hasAirConditioning: false,
    hasPowerBackup: false,
    isOpenNow: true,
    openingHours: 'مفتوح دائماً',
    translations: {
      ar: {
        name: 'شاطئ الشفار - صفاقس',
        description: 'الشاطئ الرملي الأجمل في ولاية صفاقس. مثالي للنزهات العائلية، السباحة، كرة الطائرة الشاطئية، والاستمتاع بغروب الشمس.',
        locationName: 'المحرس / الشفار، صفاقس الجنوبية',
        city: 'صفاقس',
        badge: 'دخول مجاني',
      },
      fr: {
        name: 'Plage de Chaffar Sfax',
        description: 'La plus belle plage de sable fin de la région de Sfax. Idéale pour les baignades estivales, pique-niques en famille et couchers de soleil.',
        locationName: 'Plage Chaffar, Mahres, Sfax',
        city: 'Sfax',
        badge: 'Accès Gratuit',
      },
      en: {
        name: 'Chaffar Beach Sfax',
        description: 'The premier sandy coastline in the Sfax region. Perfect for family picnics, beach volleyball, relaxing swims, and stunning sunsets.',
        locationName: 'Chaffar Beach, Mahres, Sfax',
        city: 'Sfax',
        badge: 'Free Access',
      },
    },
  },
];

/**
 * Helper: Obtient la chaîne localisée (AR, FR, EN) pour une activité
 */
export function getActivityLocalizedText(
  activity: Activity,
  field: 'name' | 'description' | 'location' | 'badge' | 'city',
  language: 'ar' | 'fr' | 'en' = 'ar'
): string {
  if (activity.translations && activity.translations[language]) {
    const t = activity.translations[language]!;
    if (field === 'name' && t.name) return t.name;
    if (field === 'description' && t.description) return t.description;
    if (field === 'location' && t.locationName) return t.locationName;
    if (field === 'badge' && t.badge) return t.badge;
    if (field === 'city' && t.city) return t.city;
  }

  if (language === 'fr') {
    if (field === 'name' && activity.nameFr) return activity.nameFr;
    if (field === 'description' && activity.descriptionFr) return activity.descriptionFr;
    if (field === 'location' && activity.locationNameFr) return activity.locationNameFr;
    if (field === 'badge' && activity.badgeFr) return activity.badgeFr;
    if (field === 'city' && activity.cityFr) return activity.cityFr;
  } else if (language === 'en') {
    if (field === 'name' && activity.nameEn) return activity.nameEn;
    if (field === 'description' && activity.descriptionEn) return activity.descriptionEn;
    if (field === 'location' && activity.locationNameEn) return activity.locationNameEn;
    if (field === 'badge' && activity.badgeEn) return activity.badgeEn;
    if (field === 'city' && activity.cityEn) return activity.cityEn;
  } else {
    if (field === 'name' && activity.nameAr) return activity.nameAr;
    if (field === 'description' && activity.descriptionAr) return activity.descriptionAr;
    if (field === 'location' && activity.locationNameAr) return activity.locationNameAr;
    if (field === 'badge' && activity.badgeAr) return activity.badgeAr;
    if (field === 'city' && activity.cityAr) return activity.cityAr;
  }

  if (field === 'name') return activity.name;
  if (field === 'description') return activity.description || '';
  if (field === 'location') return activity.location || '';
  if (field === 'badge') return activity.priceTag || '';
  if (field === 'city') return activity.city;
  return '';
}

/**
 * Returns a clone of Activity with all visible text fields adapted to the chosen language
 */
export function localizeActivity(activity: Activity, language: 'ar' | 'fr' | 'en' = 'ar'): Activity {
  return {
    ...activity,
    name: getActivityLocalizedText(activity, 'name', language),
    description: getActivityLocalizedText(activity, 'description', language),
    location: getActivityLocalizedText(activity, 'location', language),
    city: getActivityLocalizedText(activity, 'city', language),
    priceTag: getActivityLocalizedText(activity, 'badge', language) || activity.priceTag,
  };
}

/**
 * Récupère la liste des activités depuis le backend.
 * En cas d'erreur réseau ou base vide, retourne les données réelles et vérifiées de Sfax.
 */
export async function getActivities(filters: ActivityFilters = {}): Promise<Activity[]> {
  try {
    const params = new URLSearchParams();
    if (filters.city) params.set('city', filters.city);
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    console.log(`[activityService] 🚀 Envoi requête GET ${getApiBaseUrl()}/activities${query}...`);

    const response = await apiFetch(`/activities${query}`, { method: 'GET' });

    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload.activities) && payload.activities.length > 0) {
        console.log(`[activityService] ✅ Succès API ! ${payload.activities.length} activités récupérées depuis MongoDB.`);
        return (payload.activities as Record<string, unknown>[]).map(mapActivity);
      }
    }
  } catch (error) {
    console.warn(`[activityService] ℹ️ Utilisation du catalogue local Sfax (backend hors-ligne ou vide):`, error);
  }

  // Filtrage local robuste sur les activités authentiques de Sfax
  let localActivities = [...DEFAULT_SFAX_ACTIVITIES];
  if (filters.category) {
    localActivities = localActivities.filter((a) => a.category === filters.category);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    localActivities = localActivities.filter(
      (a) =>
        a.name.toLowerCase().includes(s) ||
        (a.description && a.description.toLowerCase().includes(s)) ||
        (a.location && a.location.toLowerCase().includes(s))
    );
  }
  return localActivities;
}

/**
 * Récupère les catégories d'activités (chargées dynamiquement depuis MongoDB).
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await apiFetch('/categories', { method: 'GET' });
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload.categories) && payload.categories.length > 0) {
        const mappedCats: LocalizedCategory[] = payload.categories.map((c: any) => ({
          id: c.slug || c._id || c.id,
          name: c.nameAr || c.name,
          nameAr: c.nameAr || c.name,
          nameFr: c.nameFr || c.name,
          nameEn: c.nameEn || c.name,
          icon: c.icon || 'star-outline',
          color: c.color || '#3B82F6',
        }));
        setDynamicCategories(mappedCats);
        return mappedCats as Category[];
      }
    }
  } catch (error) {
    console.warn('[activityService] ℹ️ Repli sur les catégories locales:', error);
  }
  return CATEGORIES as Category[];
}


export interface RecommendationFilters {
  group?: 'Solo' | 'Couple' | 'Amis' | 'Famille';
  budget?: string;
  budgetMax?: number;
  duration?: string;
  durationMin?: number;
  durationMax?: number;
  category?: string;
  mood?: string;
  distance?: string;
  distanceMax?: number;
  situation?: 'hot' | 'rain' | 'powercut' | 'open_now' | 'surprise_me';
}

/**
 * Récupère des activités recommandées depuis le backend via POST /api/activities/recommendations.
 * Interroge exclusivement MongoDB.
 */
export async function getRecommendations(
  filters: RecommendationFilters = {},
  sortBy: 'rating' | 'price' | 'distance' = 'rating'
): Promise<Activity[]> {
  try {
    console.log(`[activityService] 🎯 Envoi de la requête de recommandation au backend...`);
    const response = await apiFetch('/activities/recommendations', {
      method: 'POST',
      body: JSON.stringify({ filters, sortBy }),
    });

    if (!response.ok) {
      console.warn(`[activityService] ⚠️ Erreur API recommandations (${response.status})`);
      return [];
    }

    const payload = await response.json();
    console.log(`[activityService] 🎯 ${payload.activities?.length || 0} recommandations reçues du backend MongoDB !`);
    return (payload.activities as Record<string, unknown>[]).map(mapActivity);
  } catch (error) {
    console.warn('[activityService] ⚠️ Erreur réseau recommandations:', error);
    return [];
  }
}

/**
 * Récupère les détails d'une activité par son ID.
 */
export async function getActivityById(id: string): Promise<Activity | null> {
  try {
    const response = await apiFetch(`/activities/${id}`, { method: 'GET' });

    if (!response.ok) return null;

    const payload = await response.json();
    return mapActivity(payload.activity as Record<string, unknown>);
  } catch (error) {
    console.warn('[activityService] Erreur lors de la recuperation de l activite:', error);
    return null;
  }
}

// ─────────────────────────────────────────────
// API Protégées (Admin / Partner — token obligatoire)
// ─────────────────────────────────────────────

/**
 * Crée une nouvelle activité.
 * Requiert un token avec le rôle admin ou partner.
 */
export async function createActivity(data: Partial<Activity>): Promise<Activity> {
  const response = await apiFetch(
    '/activities',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la création de l\'activité.');
  }
  return mapActivity(payload.activity as Record<string, unknown>);
}

/**
 * Met à jour une activité existante.
 * Les partenaires ne peuvent modifier que leurs propres activités (vérification côté backend).
 */
export async function updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
  const response = await apiFetch(
    `/activities/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    true
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la mise à jour de l\'activité.');
  }
  return mapActivity(payload.activity as Record<string, unknown>);
}

/**
 * Supprime une activité.
 * Les partenaires ne peuvent supprimer que leurs propres activités (vérification côté backend).
 */
export async function deleteActivity(id: string): Promise<void> {
  const response = await apiFetch(
    `/activities/${id}`,
    { method: 'DELETE' },
    true
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la suppression de l\'activité.');
  }
}

// ─────────────────────────────────────────────
// Gestion des Favoris dans MongoDB
// ─────────────────────────────────────────────

/**
 * Récupère les IDs des activités favorites de l'utilisateur connecté depuis MongoDB.
 */
export async function getUserFavorites(): Promise<string[]> {
  try {
    const token = getAuthToken();
    if (!token) return [];

    const response = await apiFetch('/auth/favorites', { method: 'GET' }, true);
    if (!response.ok) return [];

    const payload = await response.json();
    return (payload.favoriteIds as string[]) || [];
  } catch (error) {
    console.warn('[activityService] Erreur lors de la récupération des favoris utilisateur:', error);
    return [];
  }
}

/**
 * Ajoute ou retire une activité des favoris de l'utilisateur dans MongoDB.
 */
export async function toggleActivityFavorite(
  activityId: string
): Promise<{ isFavorite: boolean; favorites: string[] }> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { isFavorite: false, favorites: [] };
    }

    const response = await apiFetch(`/activities/${activityId}/favorite`, { method: 'POST' }, true);
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour des favoris.');
    }

    const payload = await response.json();
    console.log(`[activityService] ❤️ Favori mis à jour dans MongoDB pour ${activityId} (status: ${payload.isFavorite})`);
    return {
      isFavorite: Boolean(payload.isFavorite),
      favorites: (payload.favorites as string[]) || [],
    };
  } catch (error) {
    console.warn('[activityService] Erreur lors du toggle favori sur le serveur:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────
// Gestion des Avis & Réactions Facebook (MongoDB)
// ─────────────────────────────────────────────

export type FacebookReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface ReviewReaction {
  user: string;
  userName: string;
  userAvatar?: string;
  type: FacebookReactionType;
}

export interface ActivityReview {
  _id: string;
  user: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  reactions: ReviewReaction[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Récupère tous les avis d'une activité depuis MongoDB.
 */
export async function getActivityReviews(activityId: string): Promise<ActivityReview[]> {
  try {
    const response = await apiFetch(`/activities/${activityId}/reviews`, { method: 'GET' });
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload.reviews as ActivityReview[]) || [];
  } catch (err) {
    console.warn('[activityService] Erreur chargement des avis MongoDB:', err);
    return [];
  }
}

/**
 * Publie un nouvel avis sur une activité dans MongoDB.
 */
export async function addActivityReview(
  activityId: string,
  rating: number,
  comment: string
): Promise<{ reviews: ActivityReview[]; averageRating: number; reviewsCount: number }> {
  const response = await apiFetch(
    `/activities/${activityId}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    },
    true
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la publication de votre avis.');
  }

  return {
    reviews: payload.reviews || [],
    averageRating: payload.averageRating,
    reviewsCount: payload.reviewsCount,
  };
}

/**
 * Modifie un avis existant dans MongoDB.
 */
export async function updateActivityReview(
  activityId: string,
  reviewId: string,
  rating: number,
  comment: string
): Promise<{ reviews: ActivityReview[]; averageRating: number; reviewsCount: number }> {
  const response = await apiFetch(
    `/activities/${activityId}/reviews/${reviewId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ rating, comment }),
    },
    true
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la mise à jour de l\'avis.');
  }

  return {
    reviews: payload.reviews || [],
    averageRating: payload.averageRating,
    reviewsCount: payload.reviewsCount,
  };
}

/**
 * Supprime un avis dans MongoDB.
 */
export async function deleteActivityReview(
  activityId: string,
  reviewId: string
): Promise<{ reviews: ActivityReview[]; averageRating: number; reviewsCount: number }> {
  const response = await apiFetch(
    `/activities/${activityId}/reviews/${reviewId}`,
    {
      method: 'DELETE',
    },
    true
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la suppression de l\'avis.');
  }

  return {
    reviews: payload.reviews || [],
    averageRating: payload.averageRating,
    reviewsCount: payload.reviewsCount,
  };
}

/**
 * Réagit à un avis avec une réaction de style Facebook (like, love, haha, wow, sad, angry).
 */
export async function reactToActivityReview(
  activityId: string,
  reviewId: string,
  reactionType: FacebookReactionType
): Promise<{ reviews: ActivityReview[]; userReaction: FacebookReactionType | null }> {
  const response = await apiFetch(
    `/activities/${activityId}/reviews/${reviewId}/react`,
    {
      method: 'POST',
      body: JSON.stringify({ type: reactionType }),
    },
    true
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur lors de la réaction.');
  }

  return {
    reviews: payload.reviews || [],
    userReaction: payload.userReaction,
  };
}

/**
 * Récupère le statut des options globales (ex: Mode alerte électricité déclenché par l'admin)
 */
export async function fetchSystemStatus(): Promise<{ electricityAlertActive: boolean }> {
  try {
    const response = await apiFetch('/activities/system-status', { method: 'GET' });
    const payload = await response.json();
    return {
      electricityAlertActive: Boolean(payload.electricityAlertActive),
    };
  } catch (err) {
    return { electricityAlertActive: false };
  }
}

/**
 * Signalement communautaire par un simple utilisateur : confirme la présence de lumière ou une coupure
 */
export async function reportActivityPowerStatus(
  activityId: string,
  hasPower: boolean
): Promise<{
  yesVotes: number;
  noVotes: number;
  lastReportAt?: string | null;
  lastReportStatus?: 'light_on' | 'light_off' | null;
  userVote?: 'yes' | 'no' | null;
  message?: string;
}> {
  const response = await apiFetch(
    `/activities/${activityId}/power-report`,
    {
      method: 'POST',
      body: JSON.stringify({ hasPower }),
    },
    true
  );

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Impossible d\'enregistrer votre signalement.');
  }

  return {
    ...payload.powerReports,
    message: payload.message,
  };
}



