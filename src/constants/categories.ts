import type { Category } from '../types';

export interface LocalizedCategory extends Category {
  color: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
}

export const CATEGORIES: LocalizedCategory[] = [
  { id: 'fun', name: 'ترفيه', nameAr: 'ترفيه', nameFr: 'Divertissement', nameEn: 'Entertainment', icon: 'game-controller-outline', color: '#FF4B5C' },
  { id: 'sport', name: 'رياضة', nameAr: 'رياضة', nameFr: 'Sport & Fitness', nameEn: 'Sports & Fitness', icon: 'fitness-outline', color: '#3B82F6' },
  { id: 'couple', name: 'كوبل', nameAr: 'كوبل', nameFr: 'En Couple', nameEn: 'Couples', icon: 'heart-outline', color: '#EC4899' },
  { id: 'friends', name: 'صحاب', nameAr: 'صحاب', nameFr: 'Entre Amis', nameEn: 'Friends', icon: 'people-outline', color: '#8B5CF6' },
  { id: 'outdoor', name: 'هواء طلق', nameAr: 'هواء طلق', nameFr: 'Plein Air & Mer', nameEn: 'Outdoors & Beach', icon: 'leaf-outline', color: '#10B981' },
  { id: 'food', name: 'أكل ومقاهي', nameAr: 'أكل ومقاهي', nameFr: 'Cafés & Restos', nameEn: 'Cafes & Food', icon: 'restaurant-outline', color: '#F59E0B' },
  { id: 'creative', name: 'ثقافة وإبداع', nameAr: 'ثقافة وإبداع', nameFr: 'Culture & Créatif', nameEn: 'Culture & Creative', icon: 'color-palette-outline', color: '#6366F1' },
];

let dynamicCategoriesCache: LocalizedCategory[] = [...CATEGORIES];

export function setDynamicCategories(cats: LocalizedCategory[]) {
  if (Array.isArray(cats) && cats.length > 0) {
    dynamicCategoriesCache = cats;
  }
}

export function getLocalizedCategories(language: string = 'ar', sourceList?: LocalizedCategory[]): LocalizedCategory[] {
  const target = sourceList && sourceList.length > 0 ? sourceList : dynamicCategoriesCache;
  return target.map((cat) => ({
    ...cat,
    name: language === 'fr' ? (cat.nameFr || cat.name) : language === 'en' ? (cat.nameEn || cat.name) : (cat.nameAr || cat.name),
  }));
}


