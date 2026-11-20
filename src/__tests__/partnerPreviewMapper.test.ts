import { mapPartnerItemToActivity } from '../utils/partnerPreviewMapper';
import type { PartnerActivityItem } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runPartnerPreviewMapperTests() {
  const mockPartnerItem: PartnerActivityItem = {
    _id: 'act-123',
    name: 'Café Sidi Bou',
    category: 'cafe',
    city: 'Sfax',
    address: 'Route de Téniour Km 2',
    price: 15,
    description: 'Café convivial avec terrasse',
    imageUrl: 'https://example.com/cover.jpg',
    photos: ['https://example.com/cover.jpg', 'https://example.com/photo2.jpg'],
    openingTime: '08:00',
    closingTime: '23:30',
    openDays: ['Tous les jours'],
    phone: '+216 74 111 222',
    whatsapp: '+216 98 111 222',
    menu: {
      images: ['https://example.com/menu1.jpg'],
      currency: 'DT',
      sections: [
        {
          id: 's1',
          title: 'Boissons',
          items: [{ id: 'i1', name: 'Café Express', price: 3.5 }],
        },
      ],
    },
    isApproved: false,
  };

  const activity = mapPartnerItemToActivity(mockPartnerItem, 'pro');

  assert(activity.id === 'act-123', 'id should match _id');
  assert(activity.name === 'Café Sidi Bou', 'name should match');
  assert(activity.photos?.length === 2, 'photos length should be 2');
  assert(activity.menu?.sections?.length === 1, 'menu sections length should be 1');
  assert(activity.partnerTier === 'pro', 'partnerTier should be pro');
  assert(activity.rating === 0, 'rating should be 0 when no reviews');
  assert(activity.reviewsCount === 0, 'reviewsCount should be 0');
}
