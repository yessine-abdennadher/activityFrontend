import { Platform, ViewStyle } from 'react-native';
import type { PartnerTier } from '../types';

export interface PartnerTierVisualTheme {
  tier: PartnerTier;
  accent: string;
  softBg: string;
  border: string;
  label: string;
}

/**
 * Style de surface Premium (Apple / Stripe / Revolut) :
 * - Zéro halo gris boueux sur Android (elevation: 0, contraste net fond/carte + bordure hairline)
 * - Ombre diffuse soyeuse sur iOS en mode clair, désactivée en mode sombre
 */
export function getPremiumCardShadow(isDark: boolean): ViewStyle {
  if (isDark) {
    return {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      elevation: 0,
      shadowOpacity: 0,
    };
  }
  if (Platform.OS === 'ios') {
    return {
      borderWidth: 1,
      borderColor: 'rgba(15, 23, 42, 0.06)',
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
    };
  }
  // Android : bordure hairline nette sans ombre grise sale
  return {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 0,
  };
}

/**
 * Ombre colorée ambiante pour les cartes dégradées (Hero / VIP / Statut)
 */
export function getColoredGlowShadow(accentColor: string, isDark: boolean): ViewStyle {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.35 : 0.22,
      shadowRadius: 16,
    };
  }
  return {
    elevation: 3,
    shadowColor: accentColor,
  };
}

/**
 * Palette visuelle officielle par palier partenaire :
 * - Standard : Indigo (#4F46E5)
 * - Pro : Orange / Ambre (#EA580C)
 * - Premium : Violet Signature (#9333EA)
 */
export function getPartnerTierTheme(
  tier: PartnerTier,
  isDark: boolean
): PartnerTierVisualTheme {
  if (tier === 'premium') {
    return {
      tier: 'premium',
      accent: '#9333EA',
      softBg: isDark ? '#2E1065' : '#FAF5FF',
      border: isDark ? '#7E22CE' : '#C084FC',
      label: 'PREMIUM',
    };
  }
  if (tier === 'pro') {
    return {
      tier: 'pro',
      accent: '#EA580C',
      softBg: isDark ? '#431407' : '#FFF7ED',
      border: isDark ? '#C2410C' : '#FDBA74',
      label: 'PRO',
    };
  }
  return {
    tier: 'standard',
    accent: '#4F46E5',
    softBg: isDark ? '#1E293B' : '#EEF2FF',
    border: isDark ? '#334155' : '#C7D2FE',
    label: 'STANDARD',
  };
}
