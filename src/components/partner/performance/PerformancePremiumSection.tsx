import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../theme/theme';
import { PartnerActivityItem } from '../../../types';
import {
  getPartnerTierTheme,
  getPremiumCardShadow,
} from '../../../utils/partnerTierTheme';

interface PerformancePremiumSectionProps {
  isPremium: boolean;
  totalEventsCount: number;
  hasFeaturedVenue: boolean;
  mainActivity: PartnerActivityItem | null;
  theme: ThemeColors;
  isDark: boolean;
  onEventPress?: (activity: PartnerActivityItem) => void;
  onUpgradePress?: (target: 'pro' | 'premium') => void;
}

export const PerformancePremiumSection: React.FC<PerformancePremiumSectionProps> = ({
  isPremium,
  totalEventsCount,
  hasFeaturedVenue,
  mainActivity,
  theme,
  isDark,
  onEventPress,
  onUpgradePress,
}) => {
  const premiumTheme = getPartnerTierTheme('premium', isDark);
  const premiumShadow = getPremiumCardShadow(isDark);
  const subtleBorder = isDark ? '#1E293B' : '#E2E8F0';

  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: theme.cardBg,
          borderColor: isPremium ? premiumTheme.border : subtleBorder,
        },
        premiumShadow,
      ]}
    >
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWrap}>
          <View style={[styles.sectionSquircle, { backgroundColor: premiumTheme.softBg }]}>
            <Ionicons name="ribbon" size={16} color={premiumTheme.accent} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
            Visibilité & Événements VIP
          </Text>
        </View>
        <View
          style={[
            styles.tierTag,
            { backgroundColor: isPremium ? premiumTheme.softBg : isDark ? '#1E293B' : '#F1F5F9' },
          ]}
        >
          <Ionicons
            name={isPremium ? 'checkmark-circle' : 'lock-closed'}
            size={12}
            color={isPremium ? premiumTheme.accent : '#64748B'}
          />
          <Text
            style={[
              styles.tierTagText,
              { color: isPremium ? premiumTheme.accent : '#64748B' },
            ]}
          >
            {isPremium ? 'VIP Actif' : 'PREMIUM'}
          </Text>
        </View>
      </View>

      {isPremium ? (
        <View style={styles.premiumSplitRow}>
          <TouchableOpacity
            style={[
              styles.miniStatBox,
              {
                backgroundColor: isDark ? '#0F172A' : '#FAF5FF',
                borderColor: premiumTheme.border,
              },
            ]}
            onPress={() => mainActivity && onEventPress?.(mainActivity)}
            activeOpacity={0.75}
            disabled={!mainActivity || !onEventPress}
          >
            <Ionicons name="musical-notes-outline" size={17} color={premiumTheme.accent} />
            <Text style={[styles.miniStatValue, { color: premiumTheme.accent }]}>
              {totalEventsCount}
            </Text>
            <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>
              Événements live
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.miniStatBox,
              {
                backgroundColor: isDark ? '#0F172A' : '#FAF5FF',
                borderColor: premiumTheme.border,
              },
            ]}
          >
            <Ionicons name="sparkles-outline" size={17} color={premiumTheme.accent} />
            <Text style={[styles.miniStatValue, { color: premiumTheme.accent }]}>
              {hasFeaturedVenue ? 'En tête' : 'Prioritaire'}
            </Text>
            <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>
              Classement Hamla
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.lockedBlock}>
          <Text style={[styles.lockedDesc, { color: theme.textMuted }]}>
            Diffusez vos soirées live avec notification locale et apparaissez en priorité sur Hamla.
          </Text>
          <TouchableOpacity
            style={[styles.upgradeInlineBtn, { backgroundColor: premiumTheme.accent }]}
            onPress={() => onUpgradePress?.('premium')}
            activeOpacity={0.85}
          >
            <Ionicons name="ribbon" size={14} color="#FFFFFF" />
            <Text style={styles.upgradeInlineBtnText}>Découvrir le Pack PREMIUM</Text>
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
  premiumSplitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniStatBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'flex-start',
    gap: 4,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  miniStatLabel: {
    fontSize: 11,
    fontWeight: '600',
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
