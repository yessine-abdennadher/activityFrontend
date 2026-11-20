import type { Activity, PartnerActivityItem, PartnerTier } from '../types';

/**
 * Mappe un PartnerActivityItem vers le type complet Activity pour l'affichage
 * haute-fidélité dans ActivityDetailsScreen (« Mode Aperçu Partenaire »).
 */
export function mapPartnerItemToActivity(
  item: PartnerActivityItem,
  partnerTier?: PartnerTier
): Activity {
  const fallbackImg =
    item.imageUrl ||
    item.image ||
    (item.photos && item.photos.length > 0 ? item.photos[0] : '') ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

  const photosList =
    Array.isArray(item.photos) && item.photos.length > 0
      ? item.photos
      : fallbackImg
      ? [fallbackImg]
      : [];

  const categoryIcons: Record<string, string> = {
    food: 'restaurant-outline',
    cafe: 'cafe-outline',
    fun: 'game-controller-outline',
    sport: 'fitness-outline',
    outdoor: 'leaf-outline',
    creative: 'color-palette-outline',
  };

  const primaryPhoto = photosList[0] || fallbackImg;
  const reviewsCount = Number(item.reviewsCount) || 0;
  const rating = reviewsCount > 0 ? Number(item.rating) || 0 : 0;

  return {
    id: item._id || item.id || 'preview-act',
    name: item.name || 'Mon Établissement',
    nameAr: item.name,
    nameFr: item.name,
    nameEn: item.name,
    category: item.category || 'food',
    categoryIcon: categoryIcons[item.category] || 'restaurant-outline',
    city: item.city || 'Tunisie',
    cityAr: item.city || 'تونس',
    cityFr: item.city || 'Tunisie',
    cityEn: item.city || 'Tunisia',
    price: Number(item.price) || 0,
    duration: '1h - 2h',
    distance: item.address || item.city || 'À proximité',
    rating,
    reviewsCount,
    image: primaryPhoto,
    imageUrl: primaryPhoto,
    photos: photosList,
    description: item.description || '',
    descriptionAr: item.description || '',
    descriptionFr: item.description || '',
    descriptionEn: item.description || '',
    location: item.address || item.city || '',
    locationNameAr: item.address || item.city,
    locationNameFr: item.address || item.city,
    locationNameEn: item.address || item.city,
    latitude: item.coordinates?.latitude,
    longitude: item.coordinates?.longitude,
    priceTag: `${item.price || 0} DT`,
    averagePrice: Number(item.price) || 0,
    priceRange: `${item.price || 0} DT`,
    priceLevel: (item.price || 0) > 60 ? '$$$' : (item.price || 0) > 30 ? '$$' : '$',
    openingTime: item.openingTime || '09:00',
    closingTime: item.closingTime || '23:00',
    openDays: item.openDays && item.openDays.length > 0 ? item.openDays : ['Tous les jours'],
    phone: item.phone,
    whatsapp: item.whatsapp || item.phone,
    events: item.events,
    promotion: item.promotion,
    partnerTier: partnerTier,
    hasPowerBackup: item.hasPowerBackup ?? true,
    powerBackupMode: item.powerBackupMode ?? false,
    hasAirConditioning: item.hasAirConditioning ?? true,
    isOpenNow: true,
    menuImageUrl:
      item.menuImageUrl ||
      (item.menu?.images && item.menu.images.length > 0 ? item.menu.images[0] : undefined),
    menuUrl: item.menuUrl,
    menu: item.menu,
    instagram: item.instagram,
    facebook: item.facebook,
    mapsUrl: item.mapsUrl,
    loyaltyProgram: item.loyaltyProgram,
  };
}
