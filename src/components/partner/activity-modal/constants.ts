import { Ionicons } from '@expo/vector-icons';
import type { PartnerTier } from '../../../types';

export const TUNISIAN_CITIES = [
  { key: 'Sfax', label: 'Sfax' },
  { key: 'Tunis', label: 'Tunis' },
  { key: 'Sousse', label: 'Sousse' },
  { key: 'Ariana', label: 'Ariana' },
  { key: 'Ben Arous', label: 'Ben Arous' },
  { key: 'Manouba', label: 'Manouba' },
  { key: 'Nabeul', label: 'Nabeul' },
  { key: 'Hammamet', label: 'Hammamet' },
  { key: 'Monastir', label: 'Monastir' },
  { key: 'Mahdia', label: 'Mahdia' },
  { key: 'Bizerte', label: 'Bizerte' },
  { key: 'Djerba', label: 'Djerba' },
  { key: 'Médenine', label: 'Médenine' },
  { key: 'Gabès', label: 'Gabès' },
  { key: 'Kairouan', label: 'Kairouan' },
  { key: 'Gafsa', label: 'Gafsa' },
  { key: 'Tozeur', label: 'Tozeur' },
  { key: 'Kébili', label: 'Kébili' },
  { key: 'Tataouine', label: 'Tataouine' },
  { key: 'Béja', label: 'Béja' },
  { key: 'Jendouba', label: 'Jendouba' },
  { key: 'Le Kef', label: 'Le Kef' },
  { key: 'Siliana', label: 'Siliana' },
  { key: 'Sidi Bouzid', label: 'Sidi Bouzid' },
  { key: 'Kasserine', label: 'Kasserine' },
  { key: 'Zaghouan', label: 'Zaghouan' },
];

export interface PartnerCategoryOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selectedIcon?: keyof typeof Ionicons.glyphMap;
}

export const PARTNER_CATEGORIES: PartnerCategoryOption[] = [
  { key: 'food', label: 'Restaurant & Gastronomie', icon: 'restaurant-outline', selectedIcon: 'restaurant' },
  { key: 'relax', label: 'Café & Salon de thé', icon: 'cafe-outline', selectedIcon: 'cafe' },
  { key: 'fun', label: 'Loisirs & Jeux', icon: 'game-controller-outline', selectedIcon: 'game-controller' },
  { key: 'sport', label: 'Sport & Fitness', icon: 'barbell-outline', selectedIcon: 'barbell' },
  { key: 'outdoor', label: 'Plein Air & Mer', icon: 'leaf-outline', selectedIcon: 'leaf' },
  { key: 'creative', label: 'Culture & Créatif', icon: 'color-palette-outline', selectedIcon: 'color-palette' },
  { key: 'music', label: 'Musique & Soirées', icon: 'musical-notes-outline', selectedIcon: 'musical-notes' },
];

export interface PartnerAmenityOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selectedIcon: keyof typeof Ionicons.glyphMap;
}

export const PARTNER_AMENITIES: PartnerAmenityOption[] = [
  { key: 'wifi', label: 'Wi-Fi haut débit', icon: 'wifi-outline', selectedIcon: 'wifi' },
  { key: 'terrace', label: 'Terrasse / Plein air', icon: 'sunny-outline', selectedIcon: 'sunny' },
  { key: 'parking', label: 'Parking dédié', icon: 'car-outline', selectedIcon: 'car' },
  { key: 'card_payment', label: 'Paiement Carte / TPE', icon: 'card-outline', selectedIcon: 'card' },
  { key: 'sports_broadcast', label: 'Diffusion Matchs / Sport', icon: 'football-outline', selectedIcon: 'football' },
  { key: 'coworking', label: 'Prises & Espace travail', icon: 'laptop-outline', selectedIcon: 'laptop' },
  { key: 'kids_friendly', label: 'Espace Famille', icon: 'people-outline', selectedIcon: 'people' },
  { key: 'chicha', label: 'Espace Chicha', icon: 'flame-outline', selectedIcon: 'flame' },
  { key: 'accessible', label: 'Accès PMR', icon: 'accessibility-outline', selectedIcon: 'accessibility' },
  { key: 'pets_friendly', label: 'Animaux bienvenus', icon: 'paw-outline', selectedIcon: 'paw' },
];

export const OPEN_DAYS_OPTIONS = [
  'Tous les jours',
  'Lun - Sam',
  'Lun - Ven',
  'Week-end uniquement',
];

export const MAX_PHOTOS_BY_TIER: Record<PartnerTier, number> = {
  standard: 1,
  pro: 5,
  premium: 10,
};

/**
 * Nettoie et supprime systématiquement le préfixe 216 / +216
 * pour n'afficher et ne manipuler que les chiffres locaux
 */
export function strip216(phoneStr?: string): string {
  if (!phoneStr) return '';
  return phoneStr
    .replace(/^\+?216\s*/, '')
    .replace(/^00216\s*/, '')
    .trim();
}

export function sanitizeLocalPhone(raw: string): string {
  return raw
    .replace(/^\+?216\s*/, '')
    .replace(/^00216\s*/, '')
    .replace(/[^\d\s]/g, '')
    .slice(0, 12);
}
