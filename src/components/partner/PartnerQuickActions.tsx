import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import type { PartnerActivityItem, PartnerTier } from '../../types';
import { getOfferBadgeLabel } from '../../utils/promoHelpers';
import { getPartnerTierTheme } from '../../utils/partnerTierTheme';

interface PartnerQuickActionsProps {
  activity: PartnerActivityItem | null;
  isPro: boolean;
  isPremium: boolean;
  effectiveTier?: PartnerTier;
  theme: ThemeColors;
  isDark: boolean;
  onEditPress: () => void;
  onPromoPress: () => void;
  onEventPress: () => void;
  onSharePress: () => void;
}

export const PartnerQuickActions: React.FC<PartnerQuickActionsProps> = ({
  activity,
  isPro,
  isPremium,
  effectiveTier = isPremium ? 'premium' : isPro ? 'pro' : 'standard',
  theme,
  isDark,
  onEditPress,
  onPromoPress,
  onEventPress,
  onSharePress,
}) => {
  const tierTheme = getPartnerTierTheme(effectiveTier, isDark);
  const hasPromo = Boolean(activity?.promotion?.isPromo);
  const hasEvent = Boolean(activity?.events && activity.events.length > 0);

  const promoLabel = hasPromo
    ? getOfferBadgeLabel(activity?.promotion?.offerType, activity?.promotion?.discountPercent || 0)
    : 'Offre';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* 1. Modifier la Fiche (Couleur harmonisée avec le palier) */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={onEditPress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: tierTheme.softBg, borderColor: tierTheme.border },
            ]}
          >
            <Ionicons name="create-outline" size={20} color={tierTheme.accent} />
          </View>
          <Text style={[styles.actionLabel, { color: theme.textMain }]} numberOfLines={1}>
            Modifier
          </Text>
          <Text style={[styles.actionSubText, { color: theme.textMuted }]} numberOfLines={1}>
            Fiche & Infos
          </Text>
        </TouchableOpacity>

        {/* 2. Offre / Promo (PRO) */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={onPromoPress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: !isPro
                  ? isDark ? '#1E293B' : '#F1F5F9'
                  : hasPromo
                  ? isDark ? '#431407' : '#FFEDD5'
                  : isDark ? '#3B1F04' : '#FFF7ED',
                borderColor: !isPro
                  ? theme.cardBorder
                  : hasPromo
                  ? '#EA580C'
                  : '#FDBA74',
              },
            ]}
          >
            <Ionicons
              name={hasPromo ? 'pricetag' : 'pricetag-outline'}
              size={20}
              color={!isPro ? theme.textMuted : '#EA580C'}
            />
            {!isPro && (
              <View style={[styles.lockTag, { backgroundColor: '#EA580C' }]}>
                <Text style={styles.lockTagText}>PRO</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.actionLabel,
              { color: hasPromo && isPro ? '#EA580C' : theme.textMain },
            ]}
            numberOfLines={1}
          >
            {promoLabel}
          </Text>
          <Text style={[styles.actionSubText, { color: theme.textMuted }]} numberOfLines={1}>
            {!isPro ? 'Pack Pro' : hasPromo ? 'Active' : 'Réduction'}
          </Text>
        </TouchableOpacity>

        {/* 3. Soirée / Événement Live (PREMIUM) */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={onEventPress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: !isPremium
                  ? isDark ? '#1E293B' : '#F1F5F9'
                  : hasEvent
                  ? isDark ? '#2E1065' : '#F3E8FF'
                  : isDark ? '#2E1065' : '#FAF5FF',
                borderColor: !isPremium
                  ? theme.cardBorder
                  : hasEvent
                  ? '#9333EA'
                  : '#C084FC',
              },
            ]}
          >
            <Ionicons
              name={hasEvent ? 'musical-notes' : 'musical-notes-outline'}
              size={20}
              color={!isPremium ? theme.textMuted : '#9333EA'}
            />
            {!isPremium && (
              <View style={[styles.lockTag, { backgroundColor: '#9333EA' }]}>
                <Text style={styles.lockTagText}>VIP</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.actionLabel,
              { color: hasEvent && isPremium ? '#9333EA' : theme.textMain },
            ]}
            numberOfLines={1}
          >
            {hasEvent ? 'Soirée' : 'Événement'}
          </Text>
          <Text style={[styles.actionSubText, { color: theme.textMuted }]} numberOfLines={1}>
            {!isPremium ? 'Pack Premium' : hasEvent ? 'Diffusée' : 'Concert, DJ'}
          </Text>
        </TouchableOpacity>

        {/* 4. Partager la fiche */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={onSharePress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                borderColor: isDark ? '#059669' : '#A7F3D0',
              },
            ]}
          >
            <Ionicons name="share-social-outline" size={20} color="#059669" />
          </View>
          <Text style={[styles.actionLabel, { color: theme.textMain }]} numberOfLines={1}>
            Partager
          </Text>
          <Text style={[styles.actionSubText, { color: theme.textMuted }]} numberOfLines={1}>
            Lien direct
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginTop: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  lockTag: {
    position: 'absolute',
    bottom: -4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  lockTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionSubText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 1,
  },
});
