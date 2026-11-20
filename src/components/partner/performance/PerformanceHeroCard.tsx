import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { PartnerTier } from '../../../types';
import { getColoredGlowShadow, getPartnerTierTheme } from '../../../utils/partnerTierTheme';

interface PerformanceHeroCardProps {
  effectiveTier: PartnerTier;
  viewsCount: number;
  directContacts: number;
  mapsCount: number;
  conversionRate: number;
  isPro: boolean;
  isPremium: boolean;
  isDark: boolean;
}

export const PerformanceHeroCard: React.FC<PerformanceHeroCardProps> = ({
  effectiveTier,
  viewsCount,
  directContacts,
  mapsCount,
  conversionRate,
  isPro,
  isPremium,
  isDark,
}) => {
  const tierTheme = getPartnerTierTheme(effectiveTier, isDark);

  const heroGradient: [string, string] = isPremium
    ? ['#581C87', '#9333EA']
    : isPro
    ? ['#9A3412', '#EA580C']
    : ['#1E1B4B', '#4338CA'];

  const heroGlowStyle = getColoredGlowShadow(heroGradient[1], isDark);

  return (
    <LinearGradient
      colors={heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, heroGlowStyle]}
    >
      <View style={styles.heroGlow} pointerEvents="none" />
      <View style={styles.heroTopRow}>
        <View>
          <Text style={styles.heroOverline}>VUES DE VOTRE FICHE</Text>
          <Text style={styles.heroBigNumber}>{viewsCount}</Text>
        </View>
        <View style={styles.heroBadge}>
          <Ionicons
            name={isPremium ? 'ribbon' : isPro ? 'star' : 'shield-checkmark'}
            size={13}
            color="#FFFFFF"
          />
          <Text style={styles.heroBadgeText}>{tierTheme.label}</Text>
        </View>
      </View>

      <View style={styles.heroDivider} />

      <View style={styles.heroBottomRow}>
        <View style={styles.heroMiniStat}>
          <Text style={styles.heroMiniValue}>{directContacts}</Text>
          <Text style={styles.heroMiniLabel}>Contacts directs</Text>
        </View>
        <View style={styles.heroMiniStat}>
          <Text style={styles.heroMiniValue}>{mapsCount}</Text>
          <Text style={styles.heroMiniLabel}>Itinéraires GPS</Text>
        </View>
        <View style={styles.heroMiniStat}>
          <Text style={styles.heroMiniValue}>{isPro ? `${conversionRate}%` : '--'}</Text>
          <Text style={styles.heroMiniLabel}>Conversion</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    gap: 14,
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroOverline: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroBigNumber: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroMiniStat: {
    flex: 1,
  },
  heroMiniValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  heroMiniLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});
