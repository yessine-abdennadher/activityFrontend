import { Ionicons } from '@expo/vector-icons';
import { WIN_COLORS } from '../../theme/colors';
import { UserRole, PartnerTier } from '../../types';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface BadgeStyleConfig {
  color: string;
  backgroundColor: string;
  borderColor: string;
  icon: IconName;
  tag?: string;
}

/**
 * Styles chromatiques officiels pour les rôles d'utilisateurs
 * Respecte l'architecture Tfarhida (Admin = Indigo royal, Partenaire = Cyan pro, Utilisateur = Slate neutre)
 */
export function getUserRoleBadge(role: UserRole | string, isDark: boolean): BadgeStyleConfig {
  switch (role) {
    case 'admin':
      return {
        color: isDark ? '#A5B4FC' : WIN_COLORS.indigo,
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.12)',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.3)',
        icon: 'shield-checkmark',
        tag: 'ADMIN',
      };
    case 'partner':
      return {
        color: isDark ? '#38BDF8' : WIN_COLORS.cyanDark,
        backgroundColor: isDark ? 'rgba(2, 132, 199, 0.22)' : 'rgba(2, 132, 199, 0.12)',
        borderColor: isDark ? 'rgba(2, 132, 199, 0.5)' : 'rgba(2, 132, 199, 0.3)',
        icon: 'business',
        tag: 'PARTENAIRE',
      };
    case 'user':
    default:
      return {
        color: isDark ? WIN_COLORS.slate300 : WIN_COLORS.slate600,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(100, 116, 139, 0.1)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(100, 116, 139, 0.22)',
        icon: 'person-outline',
        tag: 'MEMBRE',
      };
  }
}

/**
 * Styles chromatiques haut de gamme pour les Paliers Partenaires
 * Standard = Acier neutre, Pro = Or & Ambre chaleureux, Premium = Violet Royal Signature & VIP d'excellence
 */
export function getPartnerTierBadge(tier: PartnerTier | string | undefined, isDark: boolean): BadgeStyleConfig {
  switch (tier) {
    case 'premium':
      return {
        color: isDark ? '#C084FC' : '#7C3AED',
        backgroundColor: isDark ? 'rgba(124, 58, 237, 0.25)' : 'rgba(124, 58, 237, 0.14)',
        borderColor: isDark ? '#A855F7' : 'rgba(124, 58, 237, 0.45)',
        icon: 'diamond',
        tag: 'VIP',
      };
    case 'pro':
      return {
        color: isDark ? '#FBBF24' : '#D97706',
        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.24)' : 'rgba(245, 158, 11, 0.14)',
        borderColor: isDark ? '#F59E0B' : 'rgba(245, 158, 11, 0.42)',
        icon: 'star',
        tag: 'PRO',
      };
    case 'standard':
    default:
      return {
        color: isDark ? WIN_COLORS.slate400 : WIN_COLORS.slate600,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(100, 116, 139, 0.08)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(100, 116, 139, 0.2)',
        icon: 'business-outline',
        tag: 'STANDARD',
      };
  }
}

/**
 * Styles chromatiques pour les statuts opérationnels (Actif, Suspendu, En attente)
 */
export function getStatusBadge(
  status: 'active' | 'suspended' | 'approved' | 'pending' | 'stale' | 'fresh',
  isDark: boolean
): BadgeStyleConfig {
  switch (status) {
    case 'active':
    case 'approved':
    case 'fresh':
      return {
        color: WIN_COLORS.success,
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.12)',
        borderColor: isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.3)',
        icon: 'checkmark-circle',
      };
    case 'suspended':
      return {
        color: WIN_COLORS.danger,
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.12)',
        borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.3)',
        icon: 'close-circle',
      };
    case 'pending':
    case 'stale':
      return {
        color: WIN_COLORS.warning,
        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.12)',
        borderColor: isDark ? 'rgba(245, 158, 11, 0.5)' : 'rgba(245, 158, 11, 0.3)',
        icon: 'time-outline',
      };
  }
}

/**
 * Styles chromatiques pour les fonctionnalités d'activités (À la une, Populaire / Hot)
 */
export function getActivityFeatureBadge(type: 'featured' | 'popular' | 'delete', isDark: boolean): BadgeStyleConfig {
  switch (type) {
    case 'featured':
      return {
        color: isDark ? '#FBBF24' : '#D97706',
        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.14)',
        borderColor: isDark ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)',
        icon: 'star',
      };
    case 'popular':
      return {
        color: isDark ? '#FB7185' : '#E11D48',
        backgroundColor: isDark ? 'rgba(251, 113, 133, 0.24)' : 'rgba(251, 113, 133, 0.14)',
        borderColor: isDark ? '#FB7185' : 'rgba(251, 113, 133, 0.45)',
        icon: 'flame',
      };
    case 'delete':
      return {
        color: WIN_COLORS.danger,
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.1)',
        borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.25)',
        icon: 'trash-outline',
      };
  }
}

