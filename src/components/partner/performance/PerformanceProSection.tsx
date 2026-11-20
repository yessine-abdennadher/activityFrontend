import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../theme/theme';
import { PartnerActivityItem } from '../../../types';
import {
  getPartnerTierTheme,
  getPremiumCardShadow,
} from '../../../utils/partnerTierTheme';
import { getOfferBadgeLabel } from '../../../utils/promoHelpers';

interface PerformanceProSectionProps {
  isPro: boolean;
  conversionRate: number;
  directContacts: number;
  viewsCount: number;
  activePromoActivity: PartnerActivityItem | null;
  mainActivity: PartnerActivityItem | null;
  theme: ThemeColors;
  isDark: boolean;
  onPromoPress?: (activity: PartnerActivityItem) => void;
  onUpgradePress?: (target: 'pro' | 'premium') => void;
}

export const PerformanceProSection: React.FC<PerformanceProSectionProps> = ({
  isPro,
  conversionRate,
  directContacts,
  viewsCount,
  activePromoActivity,
  mainActivity,
  theme,
  isDark,
  onPromoPress,
  onUpgradePress,
}) => {
  const proTheme = getPartnerTierTheme('pro', isDark);
  const premiumShadow = getPremiumCardShadow(isDark);
  const subtleBorder = isDark ? '#1E293B' : '#E2E8F0';
  const clampedConversionWidth = `${Math.min(100, Math.max(conversionRate > 0 ? 8 : 0, conversionRate))}%` as const;

  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: theme.cardBg,
          borderColor: isPro ? proTheme.border : subtleBorder,
        },
        premiumShadow,
      ]}
    >
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWrap}>
          <View style={[styles.sectionSquircle, { backgroundColor: proTheme.softBg }]}>
            <Ionicons name="analytics-outline" size={16} color={proTheme.accent} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
            Conversion & Promotions
          </Text>
        </View>
        <View
          style={[
            styles.tierTag,
            { backgroundColor: isPro ? proTheme.softBg : isDark ? '#1E293B' : '#F1F5F9' },
          ]}
        >
          <Ionicons
            name={isPro ? 'checkmark-circle' : 'lock-closed'}
            size={12}
            color={isPro ? proTheme.accent : '#64748B'}
          />
          <Text
            style={[
              styles.tierTagText,
              { color: isPro ? proTheme.accent : '#64748B' },
            ]}
          >
            {isPro ? 'PRO Actif' : 'PRO'}
          </Text>
        </View>
      </View>

      {isPro ? (
        <View style={styles.proContent}>
          <View
            style={[
              styles.conversionBox,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFF7ED',
                borderColor: proTheme.border,
              },
            ]}
          >
            <View style={styles.conversionTopRow}>
              <Text style={[styles.conversionLabel, { color: theme.textMain }]}>
                Taux de conversion direct
              </Text>
              <Text style={[styles.conversionValue, { color: proTheme.accent }]}>
                {conversionRate}%
              </Text>
            </View>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: isDark ? '#1E293B' : '#FED7AA' },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: clampedConversionWidth,
                    backgroundColor: proTheme.accent,
                  },
                ]}
              />
            </View>
            <Text style={[styles.conversionMeta, { color: theme.textMuted }]}>
              {directContacts} contact{directContacts > 1 ? 's' : ''} direct
              {directContacts > 1 ? 's' : ''} pour {viewsCount} vue
              {viewsCount > 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.promoCard,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: subtleBorder,
              },
            ]}
            onPress={() => {
              const target = activePromoActivity || mainActivity;
              if (target) onPromoPress?.(target);
            }}
            activeOpacity={0.8}
            disabled={!onPromoPress || (!activePromoActivity && !mainActivity)}
          >
            <View style={[styles.promoIconBox, { backgroundColor: proTheme.softBg }]}>
              <Ionicons name="pricetag" size={16} color={proTheme.accent} />
            </View>
            <View style={styles.promoInfo}>
              <Text style={[styles.promoTitle, { color: theme.textMain }]}>
                {activePromoActivity ? 'Offre Flash active' : 'Aucune offre flash active'}
              </Text>
              <Text style={[styles.promoSub, { color: theme.textMuted }]} numberOfLines={1}>
                {activePromoActivity
                  ? `${activePromoActivity.name} (${getOfferBadgeLabel(
                      activePromoActivity.promotion?.offerType,
                      activePromoActivity.promotion?.discountPercent,
                    )})`
                  : 'Lancez une promotion pour booster vos clics WhatsApp et appels'}
              </Text>
            </View>
            {onPromoPress && (activePromoActivity || mainActivity) ? (
              <Ionicons name="chevron-forward" size={16} color={proTheme.accent} />
            ) : null}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.lockedBlock}>
          <Text style={[styles.lockedDesc, { color: theme.textMuted }]}>
            Débloquez le taux de conversion détaillé, l&apos;historique cumulé et les offres flash sur Hamla.
          </Text>
          <TouchableOpacity
            style={[styles.upgradeInlineBtn, { backgroundColor: proTheme.accent }]}
            onPress={() => onUpgradePress?.('pro')}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={14} color="#FFFFFF" />
            <Text style={styles.upgradeInlineBtnText}>Passer au Pack PRO</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionSquircle: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  tierTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tierTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  proContent: {
    gap: 10,
  },
  conversionBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  conversionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  conversionValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  conversionMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  promoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoInfo: {
    flex: 1,
    gap: 2,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  promoSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  lockedBlock: {
    gap: 12,
  },
  lockedDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  upgradeInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  upgradeInlineBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
