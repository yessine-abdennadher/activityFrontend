import type { PartnerActivityItem, PromoOfferType } from '../types';

const MONTHS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const DAYS_FR = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

/**
 * Calcule le prix après réduction arrondi proprement à 1 décimale (ou entier).
 */
export function calculateDiscountedPrice(originalPrice: number, discountPercent: number): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  const clampedPct = Math.min(100, Math.max(0, discountPercent));
  const raw = originalPrice * (1 - clampedPct / 100);
  return Math.round(raw * 10) / 10;
}

/**
 * Retourne le texte du badge selon le type d'offre commerciale.
 */
export function getOfferBadgeLabel(
  offerType: PromoOfferType = 'percentage',
  discountPercent = 20
): string {
  switch (offerType) {
    case 'bogo':
      return '1+1 OFFERT';
    case 'bundle':
      return 'PACK / FORMULE';
    case 'gift':
      return 'CADEAU OFFERT';
    case 'custom':
      return 'BON PLAN';
    case 'percentage':
    default:
      return `-${discountPercent}%`;
  }
}

/**
 * Formate une date en français lisible pour les promotions (ex: "29 Novembre 2026").
 */
export function formatCalendarDateFr(date: Date): string {
  const dayName = DAYS_FR[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTHS_FR[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

/**
 * Vérifie si un jour donné (year, month 0-indexed, day) est antérieur à aujourd'hui.
 */
export function isPastCalendarDate(
  year: number,
  month: number,
  day: number,
  referenceNow: Date = new Date()
): boolean {
  const todayMidnight = new Date(
    referenceNow.getFullYear(),
    referenceNow.getMonth(),
    referenceNow.getDate()
  );
  const candidate = new Date(year, month, day);
  return candidate.getTime() < todayMidnight.getTime();
}

export interface FlattenedMenuItem {
  id: string;
  name: string;
  price: number;
  sectionTitle: string;
}

/**
 * Extrait tous les plats avec leurs prix depuis les sections du menu d'un établissement.
 */
export function extractMenuItems(activity?: PartnerActivityItem | null): FlattenedMenuItem[] {
  if (!activity?.menu?.sections || !Array.isArray(activity.menu.sections)) {
    return [];
  }
  const items: FlattenedMenuItem[] = [];
  for (const section of activity.menu.sections) {
    if (!Array.isArray(section.items)) continue;
    for (const item of section.items) {
      if (item.name && item.name.trim()) {
        items.push({
          id: item.id || `${section.title}-${item.name}`,
          name: item.name.trim(),
          price: Number(item.price) || 0,
          sectionTitle: section.title || 'Carte',
        });
      }
    }
  }
  return items;
}
