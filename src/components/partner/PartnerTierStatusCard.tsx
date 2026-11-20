import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { PartnerTier } from '../../types';
import { getColoredGlowShadow } from '../../utils/partnerTierTheme';

interface PartnerTierStatusCardProps {
  tier?: PartnerTier;
  onPressUpgrade: (target: 'pro' | 'premium') => void;
  onPressInfo: () => void;
}

export const PartnerTierStatusCard: React.FC<PartnerTierStatusCardProps> = ({
  tier = 'standard',
  onPressUpgrade,
  onPressInfo,
}) => {
  const isPro = tier === 'pro';
  const isPremium = tier === 'premium';

  const gradientColors: [string, string] = isPremium
    ? ['#581C87', '#9333EA']
    : isPro
    ? ['#9A3412', '#EA580C']
    : ['#1E1B4B', '#4338CA'];

  const iconName: keyof typeof Ionicons.glyphMap = isPremium
    ? 'ribbon'
    : isPro
    ? 'star'
    : 'shield-checkmark';

  const subtitle = isPremium
    ? 'Visibilité maximale, événements & stats avancées'
    : isPro
    ? 'Promotions %, galeries 5 photos & stats actives'
    : 'Fiche en ligne · Débloquez les promos & la fidélité';

  const ctaLabel = isPremium ? 'Privilèges' : isPro ? 'Passer VIP' : 'Passer Pro';

  const handleCtaPress = () => {
    if (isPremium) {
      onPressInfo();
    } else if (isPro) {
      onPressUpgrade('premium');
    } else {
      onPressUpgrade('pro');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPressInfo}
      style={getColoredGlowShadow(gradientColors[1], false)}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Reflet lumineux subtil */}
        <View style={styles.glowOrb} pointerEvents="none" />

        <View style={styles.leftRow}>
          <View style={styles.iconSquircle}>
            <Ionicons name={iconName} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.textCol}>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>HAMLA {tier.toUpperCase()}</Text>
              <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.75)" />
            </View>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ctaPill}
          onPress={handleCtaPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaPillText}>{ctaLabel}</Text>
          <Ionicons name="chevron-forward" size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconSquircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  ctaPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
