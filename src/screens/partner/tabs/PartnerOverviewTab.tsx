import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';
import type { PartnerActivityItem, PartnerTier } from '../../../types';
import { PartnerQuickActions } from '../../../components/partner/PartnerQuickActions';
import { PartnerOnboardingProgress } from '../../../components/partner/PartnerOnboardingProgress';
import { PartnerTierStatusCard } from '../../../components/partner/PartnerTierStatusCard';

interface PartnerOverviewTabProps {
  activity: PartnerActivityItem | null;
  effectiveTier: PartnerTier;
  isProPartner: boolean;
  isPremiumPartner: boolean;
  refreshing: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onRefresh: () => Promise<void>;
  onEditPress: () => void;
  onPromoPress: () => void;
  onEventPress: () => void;
  onSharePress: () => void;
  onUpgradePress: (target: 'pro' | 'premium') => void;
  onUpgradeInfoPress: () => void;
  onSwitchToVenueTab: () => void;
}

export const PartnerOverviewTab: React.FC<PartnerOverviewTabProps> = ({
  activity,
  effectiveTier,
  isProPartner,
  isPremiumPartner,
  refreshing,
  theme,
  isDark,
  onRefresh,
  onEditPress,
  onPromoPress,
  onEventPress,
  onSharePress,
  onUpgradePress,
  onUpgradeInfoPress,
  onSwitchToVenueTab,
}) => {
  const imgUri = activity?.imageUrl || activity?.image;
  const isOnline = Boolean(activity?.isApproved);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
    >
      {/* 1. Carte Statut & Privilèges Partenaire */}
      <PartnerTierStatusCard
        tier={effectiveTier}
        onPressUpgrade={onUpgradePress}
        onPressInfo={onUpgradeInfoPress}
      />

      {/* 2. Actions Rapides en 1 seule ligne */}
      <PartnerQuickActions
        activity={activity}
        isPro={isProPartner}
        isPremium={isPremiumPartner}
        theme={theme}
        isDark={isDark}
        onEditPress={onEditPress}
        onPromoPress={onPromoPress}
        onEventPress={onEventPress}
        onSharePress={onSharePress}
      />

      {/* 3. Carte Résumé "Vue Client" */}
      {activity && (
        <View
          style={[
            styles.venuePreviewCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View style={styles.previewHeaderRow}>
            <Text style={[styles.previewSectionTitle, { color: theme.textMain }]}>
              Aperçu en ligne
            </Text>
            <TouchableOpacity
              style={styles.seeFullBtn}
              onPress={onSwitchToVenueTab}
              activeOpacity={0.7}
            >
              <Text style={[styles.seeFullBtnText, { color: theme.primary }]}>
                Voir fiche complète
              </Text>
              <Ionicons name="arrow-forward" size={13} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.venueRow}>
            {imgUri ? (
              <Image source={{ uri: imgUri }} style={styles.venueImg} />
            ) : (
              <View style={[styles.venueImgPlaceholder, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <Ionicons name="restaurant-outline" size={24} color={theme.textMuted} />
              </View>
            )}

            <View style={styles.venueInfoCol}>
              <View style={styles.venueTitleRow}>
                <Text style={[styles.venueName, { color: theme.textMain }]} numberOfLines={1}>
                  {activity.name}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isOnline ? '#DCFCE7' : '#FEF3C7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: isOnline ? '#15803D' : '#B45309' },
                    ]}
                  >
                    {isOnline ? 'En ligne' : 'En attente'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.venueSubText, { color: theme.textMuted }]}>
                {activity.city} · {activity.category}
              </Text>

              <View style={styles.venueMetaRow}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {activity.reviewsCount && activity.reviewsCount > 0 ? activity.rating || 0 : 0} ({activity.reviewsCount || 0})
                  </Text>
                </View>
                <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>
                  {activity.price} DT
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 4. Guide de démarrage / Checklist (Refermable ou masqué à 100%) */}
      {activity && (
        <PartnerOnboardingProgress
          activity={activity}
          theme={theme}
          isDark={isDark}
          onActionPress={(_stepKey) => {
            onEditPress();
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  venuePreviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  seeFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeFullBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  venueImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  venueImgPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueInfoCol: {
    flex: 1,
    gap: 3,
  },
  venueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  venueName: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  venueSubText: {
    fontSize: 12,
  },
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
});
