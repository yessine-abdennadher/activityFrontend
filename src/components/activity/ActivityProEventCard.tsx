import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActivityEvent, ActivityPromotion } from '../../types';

interface ActivityProEventCardProps {
  events?: ActivityEvent[];
  promotion?: ActivityPromotion;
  language: string;
}

export const ActivityProEventCard: React.FC<ActivityProEventCardProps> = ({
  events,
  promotion,
  language,
}) => {
  return (
    <>
      {/* Promotion Active */}
      {promotion?.isPromo && (
        <View style={styles.promoContainer}>
          <Text style={{ fontSize: 22 }}>🏷️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>
              {promotion.promoLabel || `-${promotion.discountPercent}% PROMO`}
            </Text>
            <Text style={styles.promoSubtitle}>
              {promotion.promoType === 'item' && promotion.targetItem
                ? (language === 'ar' ? `🎯 تخفيض خاص على : ${promotion.targetItem}` : `🎯 Offre spéciale sur : ${promotion.targetItem}`)
                : (language === 'ar' ? '🔥 تخفيض شامل على كامل الفاتورة' : '🔥 Réduction valable sur toute l\'addition')}
            </Text>
          </View>
        </View>
      )}

      {/* Événement ou Soirée Live */}
      {Boolean(events && events.length > 0) && (
        <View style={styles.eventContainer}>
          <View style={styles.eventHeader}>
            <Text style={{ fontSize: 18 }}>🎵</Text>
            <Text style={styles.eventTitle}>{events![0].title}</Text>
          </View>
          <Text style={styles.eventDate}>
            📅 {events![0].date} {events![0].time ? `à ${events![0].time}` : ''}
          </Text>
          {Boolean(events![0].description) && (
            <Text style={styles.eventDescription}>{events![0].description}</Text>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  promoContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  promoSubtitle: {
    fontSize: 11,
    color: '#991B1B',
    marginTop: 2,
  },
  eventContainer: {
    backgroundColor: '#FDF2F8',
    borderColor: '#F472B6',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 6,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#BE185D',
  },
  eventDate: {
    fontSize: 12,
    color: '#9D174D',
  },
  eventDescription: {
    fontSize: 11,
    color: '#831843',
  },
});
