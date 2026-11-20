import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';
import type { PartnerTier } from '../../../types';
import { getPartnerTierTheme, getPremiumCardShadow } from '../../../utils/partnerTierTheme';

interface PerformanceKpiGridProps {
  whatsappCount: number;
  phoneCount: number;
  hasReviews: boolean;
  formattedRating: string;
  totalReviews: number;
  activeLoyaltyCount: number;
  effectiveTier: PartnerTier;
  theme: ThemeColors;
  isDark: boolean;
}

export const PerformanceKpiGrid: React.FC<PerformanceKpiGridProps> = ({
  whatsappCount,
  phoneCount,
  hasReviews,
  formattedRating,
  totalReviews,
  activeLoyaltyCount,
  effectiveTier,
  theme,
  isDark,
}) => {
  const tierTheme = getPartnerTierTheme(effectiveTier, isDark);
  const premiumShadow = getPremiumCardShadow(isDark);

  return (
    <View style={styles.kpiGrid}>
      <View style={[styles.kpiCard, { backgroundColor: theme.cardBg }, premiumShadow]}>
        <View style={[styles.kpiSquircle, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
          <Ionicons name="logo-whatsapp" size={19} color="#10B981" />
        </View>
        <Text style={[styles.kpiNumber, { color: '#10B981' }]}>{whatsappCount}</Text>
        <Text style={[styles.kpiLabel, { color: theme.textMain }]}>Clics WhatsApp</Text>
        <Text style={[styles.kpiSub, { color: theme.textMuted }]}>Réservations directes</Text>
      </View>

      <View style={[styles.kpiCard, { backgroundColor: theme.cardBg }, premiumShadow]}>
        <View style={[styles.kpiSquircle, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}>
          <Ionicons name="call-outline" size={19} color="#2563EB" />
        </View>
        <Text style={[styles.kpiNumber, { color: theme.textMain }]}>{phoneCount}</Text>
        <Text style={[styles.kpiLabel, { color: theme.textMain }]}>Appels directs</Text>
        <Text style={[styles.kpiSub, { color: theme.textMuted }]}>Prises de contact</Text>
      </View>

      <View style={[styles.kpiCard, { backgroundColor: theme.cardBg }, premiumShadow]}>
        <View style={[styles.kpiSquircle, { backgroundColor: isDark ? '#78350F' : '#FEF3C7' }]}>
          <Ionicons name="star" size={19} color="#D97706" />
        </View>
        <Text style={[styles.kpiNumber, { color: hasReviews ? '#D97706' : theme.textMuted }]}>
          {formattedRating}
        </Text>
        <Text style={[styles.kpiLabel, { color: theme.textMain }]}>Note moyenne</Text>
        <Text style={[styles.kpiSub, { color: theme.textMuted }]}>
          {hasReviews ? `${totalReviews} avis` : 'Aucun avis'}
        </Text>
      </View>

      <View style={[styles.kpiCard, { backgroundColor: theme.cardBg }, premiumShadow]}>
        <View style={[styles.kpiSquircle, { backgroundColor: tierTheme.softBg }]}>
          <Ionicons name="ribbon-outline" size={19} color={tierTheme.accent} />
        </View>
        <Text style={[styles.kpiNumber, { color: theme.textMain }]}>{activeLoyaltyCount}</Text>
        <Text style={[styles.kpiLabel, { color: theme.textMain }]}>Cartes Fidélité</Text>
        <Text style={[styles.kpiSub, { color: theme.textMuted }]}>Actives sur Hamla</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48.3%',
    borderRadius: 18,
    padding: 14,
  },
  kpiSquircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiNumber: {
    fontSize: 22,
    fontWeight: '900',
  },
  kpiLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
});
