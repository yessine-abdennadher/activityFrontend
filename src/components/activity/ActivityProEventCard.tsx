import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityEvent, ActivityPromotion } from '../../types';
import type { ThemeColors } from '../../theme/theme';
import { getOfferBadgeLabel } from '../../utils/promoHelpers';

interface ActivityProEventCardProps {
  events?: ActivityEvent[];
  promotion?: ActivityPromotion;
  language: string;
  theme?: ThemeColors;
  isDark?: boolean;
  phone?: string;
  whatsapp?: string;
  activityName?: string;
  onBookPromo?: () => void;
}

export const ActivityProEventCard: React.FC<ActivityProEventCardProps> = ({
  events,
  promotion,
  language,
  theme,
  isDark = false,
  phone,
  whatsapp,
  activityName = 'votre établissement',
  onBookPromo,
}) => {
  const isArabic = language === 'ar';

  const handleClaimPromo = () => {
    if (onBookPromo) {
      onBookPromo();
      return;
    }
    const targetContact = whatsapp || phone;
    if (!targetContact) return;

    const cleanNum = targetContact.replace(/[^0-9]/g, '');
    const promoTitle = promotion?.promoLabel || `-${promotion?.discountPercent || 20}%`;
    const message = isArabic
      ? `مرحباً، أود الاستفادة من عرضكم الخاص "${promoTitle}" الذي شاهدته على تطبيق حملة.`
      : `Bonjour, je souhaite profiter de votre offre "${promoTitle}" vue sur Hamla.`;

    const url = `https://wa.me/216${cleanNum.replace(/^216/, '')}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <>
      {/* ── 1. PROMOTION ACTIVE (COUPON PRIVILÈGE VIP) ── */}
      {promotion?.isPromo && (
        <View
          style={[
            styles.promoCard,
            {
              backgroundColor: isDark ? '#2D1700' : '#FFFBEB',
              borderColor: isDark ? '#B45309' : '#FCD34D',
            },
          ]}
        >
          {/* Ligne principale du coupon */}
          <View style={styles.promoMainRow}>
            <View style={[styles.promoIconPill, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="pricetag" size={17} color="#FFFFFF" />
            </View>

            <View style={styles.promoTextCol}>
              <View style={styles.titleWithPercentRow}>
                <Text
                  style={[
                    styles.promoTitle,
                    { color: isDark ? '#FEF3C7' : '#92400E' },
                  ]}
                  numberOfLines={1}
                >
                  {promotion.promoLabel || `Remise de -${promotion.discountPercent}%`}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    {getOfferBadgeLabel(promotion.offerType, promotion.discountPercent)}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.promoSubtitle,
                  { color: isDark ? '#FDE68A' : '#B45309' },
                ]}
              >
                {promotion.promoType === 'item' && promotion.targetItem
                  ? isArabic
                    ? `تخفيض حصري خاص بـ : ${promotion.targetItem}`
                    : `Offre exclusive sur : ${promotion.targetItem}`
                  : isArabic
                  ? 'تخفيض شامل ومباشر على كامل الفاتورة'
                  : "Réduction valable sur toute l'addition"}
              </Text>

              {Boolean(promotion.validUntil) && (
                <View style={styles.validityRow}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={isDark ? '#FCD34D' : '#D97706'}
                  />
                  <Text
                    style={[
                      styles.validityText,
                      { color: isDark ? '#FDE68A' : '#92400E' },
                    ]}
                  >
                    {isArabic ? `صالح : ${promotion.validUntil}` : `Valable : ${promotion.validUntil}`}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Bouton d'action directe "Profiter de l'offre" */}
          <TouchableOpacity
            style={[styles.claimBtn, { backgroundColor: '#D97706' }]}
            onPress={handleClaimPromo}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
            <Text style={styles.claimBtnText}>
              {isArabic ? 'الاستفادة من هذا العرض' : "Profiter de l'offre"}
            </Text>
            <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── 2. ÉVÉNEMENT / SOIRÉE LIVE SPÉCIALE ── */}
      {Boolean(events && events.length > 0) && (
        <View
          style={[
            styles.eventCard,
            {
              backgroundColor: isDark ? '#2E1065' : '#FAF5FF',
              borderColor: isDark ? '#7E22CE' : '#E9D5FF',
            },
          ]}
        >
          <View style={styles.eventHeader}>
            <View style={styles.eventIconPill}>
              <Ionicons name="musical-notes" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.eventTitle,
                  { color: isDark ? '#F5F3FF' : '#581C87' },
                ]}
              >
                {events![0].title}
              </Text>
              <View style={styles.eventDateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={isDark ? '#D8B4FE' : '#7E22CE'}
                />
                <Text
                  style={[
                    styles.eventDateText,
                    { color: isDark ? '#E9D5FF' : '#6B21A8' },
                  ]}
                >
                  {events![0].date} {events![0].time ? `· ${events![0].time}` : ''}
                </Text>
              </View>
            </View>
          </View>

          {Boolean(events![0].description) && (
            <Text
              style={[
                styles.eventDescription,
                { color: isDark ? '#DDD6FE' : '#7E22CE' },
              ]}
            >
              {events![0].description}
            </Text>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  promoCard: {
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  promoMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  promoIconPill: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  promoTextCol: {
    flex: 1,
    gap: 3,
  },
  titleWithPercentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  discountBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  promoSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  validityText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  eventCard: {
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventIconPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#7E22CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventDateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 11.5,
    lineHeight: 16,
    paddingLeft: 42,
  },
});
