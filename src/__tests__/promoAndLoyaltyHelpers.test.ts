import {
  calculateDiscountedPrice,
  getOfferBadgeLabel,
  formatCalendarDateFr,
  isPastCalendarDate,
  extractMenuItems,
} from '../utils/promoHelpers';
import { mapPartnerItemToActivity } from '../utils/partnerPreviewMapper';
import type { PartnerActivityItem } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runPromoAndLoyaltyHelperTests() {
  // 1. Calcul prix réduit
  assert(calculateDiscountedPrice(20, 25) === 15, '20 DT -25% doit faire 15 DT');
  assert(calculateDiscountedPrice(16, 20) === 12.8, '16 DT -20% doit faire 12.8 DT');
  assert(calculateDiscountedPrice(0, 20) === 0, 'Prix 0 doit rester 0');
  assert(calculateDiscountedPrice(15, 150) === 0, 'Remise >100% plafonnée à 0 DT');

  // 2. Badges multi-offres
  assert(getOfferBadgeLabel('bogo', 0) === '1+1 OFFERT', 'Badge BOGO incorrect');
  assert(getOfferBadgeLabel('bundle', 0) === 'PACK / FORMULE', 'Badge Bundle incorrect');
  assert(getOfferBadgeLabel('gift', 0) === 'CADEAU OFFERT', 'Badge Gift incorrect');
  assert(getOfferBadgeLabel('custom', 0) === 'BON PLAN', 'Badge Custom incorrect');
  assert(getOfferBadgeLabel('percentage', 30) === '-30%', 'Badge Percentage incorrect');

  // 3. Formatage date calendrier
  const dateSample = new Date(2026, 10, 29); // 29 Novembre 2026 (Dimanche)
  assert(
    formatCalendarDateFr(dateSample) === 'Dimanche 29 Novembre 2026',
    `Formatage date inattendu : ${formatCalendarDateFr(dateSample)}`
  );

  // 4. Vérification dates passées
  const refNow = new Date(2026, 10, 19, 14, 30); // 19 Nov 2026
  assert(isPastCalendarDate(2026, 10, 18, refNow) === true, 'Hier doit être marqué passé');
  assert(isPastCalendarDate(2026, 10, 19, refNow) === false, 'Aujourd’hui ne doit pas être passé');
  assert(isPastCalendarDate(2026, 10, 25, refNow) === false, 'Futur ne doit pas être passé');

  // 5. Extraction des plats du menu existant
  const mockVenue: PartnerActivityItem = {
    _id: 'v1',
    name: 'Resto Test',
    category: 'food',
    city: 'Sfax',
    price: 20,
    menu: {
      sections: [
        {
          id: 's1',
          title: 'Pizzas',
          items: [
            { id: 'p1', name: 'Margherita', price: 14 },
            { id: 'p2', name: '4 Fromages', price: 18 },
          ],
        },
        {
          id: 's2',
          title: 'Desserts',
          items: [{ id: 'd1', name: 'Tiramisu', price: 9 }],
        },
      ],
    },
    loyaltyProgram: {
      isActive: true,
      requiredStamps: 5,
      rewardType: 'free',
      rewardLabel: '6ème plat offert',
    },
  };

  const items = extractMenuItems(mockVenue);
  assert(items.length === 3, 'Doit extraire 3 plats au total');
  assert(items[1].name === '4 Fromages' && items[1].price === 18, 'Plat 2 doit correspondre');
  assert(extractMenuItems(null).length === 0, 'Null doit retourner liste vide');

  // 6. Mapping aperçu fidélité
  const mapped = mapPartnerItemToActivity(mockVenue, 'pro');
  assert(mapped.loyaltyProgram?.isActive === true, 'loyaltyProgram doit être mappé');
  assert(mapped.loyaltyProgram?.requiredStamps === 5, 'requiredStamps doit être 5');
}
