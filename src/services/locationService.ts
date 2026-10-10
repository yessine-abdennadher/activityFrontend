import * as Location from 'expo-location';
import { getApiBaseUrl } from './apiConfig';


export type LocationPermissionState = 'undetermined' | 'granted' | 'denied';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CityConfig {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  coords: Coordinates;
  isActive: boolean; // Controls whether this city is active for users in this phase
  badge?: string;
  badgeAr?: string;
  badgeFr?: string;
  badgeEn?: string;
}

/**
 * Scalable City Registry
 * Phase 1: Focused exclusively on Sfax as primary active city.
 * Additional cities (Tunis, Sousse, etc.) are structured with `isActive: false` / "Bientôt",
 * allowing seamless 1-click scaling as ActivityTN expands.
 */
export const SUPPORTED_CITIES: Record<string, CityConfig> = {
  Sfax: {
    id: 'sfax',
    name: 'Sfax',
    nameAr: 'صفاقس',
    nameFr: 'Sfax',
    nameEn: 'Sfax',
    coords: { latitude: 34.74056, longitude: 10.76028 },
    isActive: true,
    badge: 'المدينة الحالية',
    badgeAr: 'المدينة الحالية',
    badgeFr: 'Ville Active',
    badgeEn: 'Active City',
  },
  Tunis: {
    id: 'tunis',
    name: 'Tunis',
    nameAr: 'تونس العاصمة',
    nameFr: 'Tunis',
    nameEn: 'Tunis',
    coords: { latitude: 36.8065, longitude: 10.1815 },
    isActive: false,
    badge: 'قريباً',
    badgeAr: 'قريباً',
    badgeFr: 'Bientôt',
    badgeEn: 'Coming Soon',
  },
  Sousse: {
    id: 'sousse',
    name: 'Sousse',
    nameAr: 'سوسة',
    nameFr: 'Sousse',
    nameEn: 'Sousse',
    coords: { latitude: 35.8256, longitude: 10.63699 },
    isActive: false,
    badge: 'قريباً',
    badgeAr: 'قريباً',
    badgeFr: 'Bientôt',
    badgeEn: 'Coming Soon',
  },
  Monastir: {
    id: 'monastir',
    name: 'Monastir',
    nameAr: 'المنستير',
    nameFr: 'Monastir',
    nameEn: 'Monastir',
    coords: { latitude: 35.7779, longitude: 10.8262 },
    isActive: false,
    badge: 'قريباً',
    badgeAr: 'قريباً',
    badgeFr: 'Bientôt',
    badgeEn: 'Coming Soon',
  },
  Bizerte: {
    id: 'bizerte',
    name: 'Bizerte',
    nameAr: 'بنزرت',
    nameFr: 'Bizerte',
    nameEn: 'Bizerte',
    coords: { latitude: 37.2744, longitude: 9.8739 },
    isActive: false,
    badge: 'قريباً',
    badgeAr: 'قريباً',
    badgeFr: 'Bientôt',
    badgeEn: 'Coming Soon',
  },
  Hammamet: {
    id: 'hammamet',
    name: 'Hammamet',
    nameAr: 'الحمامات',
    nameFr: 'Hammamet',
    nameEn: 'Hammamet',
    coords: { latitude: 36.4, longitude: 10.61 },
    isActive: false,
    badge: 'قريباً',
    badgeAr: 'قريباً',
    badgeFr: 'Bientôt',
    badgeEn: 'Coming Soon',
  },
};

let dynamicCitiesCache: Record<string, CityConfig> = { ...SUPPORTED_CITIES };

export function setDynamicCities(cities: CityConfig[]) {
  if (Array.isArray(cities) && cities.length > 0) {
    const map: Record<string, CityConfig> = {};
    cities.forEach((c) => {
      map[c.name] = c;
    });
    dynamicCitiesCache = map;
  }
}

export async function fetchSupportedCities(): Promise<CityConfig[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/cities`);
    if (res.ok) {
      const payload = await res.json();
      if (Array.isArray(payload.cities) && payload.cities.length > 0) {
        const mapped: CityConfig[] = payload.cities.map((c: any) => ({
          id: c.slug || c.name?.toLowerCase() || c._id,
          name: c.name,
          nameAr: c.nameAr || c.name,
          nameFr: c.nameFr || c.name,
          nameEn: c.nameEn || c.name,
          coords: c.coords || { latitude: 34.74, longitude: 10.76 },
          isActive: Boolean(c.isActive),
          badge: c.badgeAr || (c.isActive ? 'المدينة الحالية' : 'قريباً'),
          badgeAr: c.badgeAr || (c.isActive ? 'المدينة الحالية' : 'قريباً'),
          badgeFr: c.badgeFr || (c.isActive ? 'Ville Active' : 'Bientôt'),
          badgeEn: c.badgeEn || (c.isActive ? 'Active City' : 'Coming Soon'),
        }));
        setDynamicCities(mapped);
        return mapped;
      }
    }
  } catch (error) {
    // Backend offline: Silent fallback to local supported cities
  }
  return Object.values(SUPPORTED_CITIES);
}


export function getLocalizedCityName(cityKey: string, language: string = 'ar'): string {
  const c = dynamicCitiesCache[cityKey] || SUPPORTED_CITIES[cityKey];
  if (!c) return cityKey;
  if (language === 'fr') return c.nameFr || c.name;
  if (language === 'en') return c.nameEn || c.name;
  return c.nameAr || c.name;
}

export function getLocalizedCityBadge(city: CityConfig, language: string = 'ar'): string | undefined {
  if (language === 'fr') return city.badgeFr || city.badge;
  if (language === 'en') return city.badgeEn || city.badge;
  return city.badgeAr || city.badge;
}


export interface UserLocationData {
  coords: Coordinates;
  city: string;
  cityAr: string;
  cityFr: string;
  cityEn: string;
  source: 'gps' | 'manual';
  isInActiveRegion: boolean;
}

// Sfax default launch fallback
export const SFAX_DEFAULT_LOCATION: UserLocationData = {
  coords: SUPPORTED_CITIES.Sfax.coords,
  city: 'Sfax',
  cityAr: 'صفاقس',
  cityFr: 'Sfax',
  cityEn: 'Sfax',
  source: 'manual',
  isInActiveRegion: true,
};

/**
 * Check current foreground location permission status
 */
export async function checkLocationPermission(): Promise<LocationPermissionState> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) return 'granted';
    if (status === Location.PermissionStatus.DENIED) return 'denied';
    return 'undetermined';
  } catch (error) {
    console.warn('[locationService] checkLocationPermission error:', error);
    return 'undetermined';
  }
}

/**
 * Request location permission from user
 */
export async function requestLocationPermission(): Promise<LocationPermissionState> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) return 'granted';
    if (status === Location.PermissionStatus.DENIED) return 'denied';
    return 'undetermined';
  } catch (error) {
    console.warn('[locationService] requestLocationPermission error:', error);
    return 'denied';
  }
}

/**
 * Fetch current GPS coordinates and resolve Sfax boundary or nearby zone
 */
export async function getLiveUserLocation(): Promise<UserLocationData | null> {
  try {
    const perm = await requestLocationPermission();
    if (perm !== 'granted') {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords: Coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    let resolvedCity = 'Sfax';
    let resolvedCityAr = 'صفاقس';
    let isSfaxOrNearby = true;

    try {
      const [address] = await Location.reverseGeocodeAsync(coords);
      if (address) {
        const rawCity = address.city || address.subregion || address.region || '';
        // Detect if user is in Sfax governorate or outside
        if (rawCity.toLowerCase().includes('sfax') || rawCity.includes('صفاقس')) {
          resolvedCity = 'Sfax';
          resolvedCityAr = 'صفاقس';
          isSfaxOrNearby = true;
        } else {
          resolvedCity = rawCity || 'Sfax';
          resolvedCityAr = rawCity || 'صفاقس';
          // User is outside Sfax: app remains operational, defaulting focal content to Sfax
          isSfaxOrNearby = false;
        }
      }
    } catch {
      // Keep Sfax fallback if reverse geocoding is rate-limited
    }

    return {
      coords,
      city: resolvedCity,
      cityAr: resolvedCityAr,
      cityFr: resolvedCity,
      cityEn: resolvedCity,
      source: 'gps',
      isInActiveRegion: isSfaxOrNearby,
    };
  } catch (error) {
    console.warn('[locationService] getLiveUserLocation error:', error);
    return null;
  }
}
