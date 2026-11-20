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
import { getPartnerTierTheme, getPremiumCardShadow } from '../../../utils/partnerTierTheme';

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
  onPreviewPress: (activity: PartnerActivityItem) => void;
  onPromoPress: () => void;
  onEventPress: () => void;
  onLoyaltyPress: () => void;
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
  onPreviewPress,
  onPromoPress,
  onEventPress,
  onLoyaltyPress,
  onSharePress,
  onUpgradePress,
  onUpgradeInfoPress,
  onSwitchToVenueTab,
}) => {
  const imgUri = activity?.imageUrl || activity?.image;
  const isOnline = Boolean(activity?.isApproved);
  const tierTheme = getPartnerTierTheme(effectiveTier, isDark);

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
        effectiveTier={effectiveTier}
        theme={theme}
        isDark={isDark}
        onEditPress={onEditPress}
        onPromoPress={onPromoPress}
        onEventPress={onEventPress}
        onSharePress={onSharePress}
      />

      {/* 3. Carte Résumé "Vue Client" harmonisée et épurée */}
      {activity && (
        <View
          style={[
            styles.venuePreviewCard,
            { backgroundColor: theme.cardBg },
            getPremiumCardShadow(isDark),
          ]}
        >
          <View style={styles.previewHeaderRow}>
            <Text style={[styles.previewSectionTitle, { color: theme.textMuted }]}>
              APERÇU EN LIGNE
            </Text>
            <TouchableOpacity
              style={styles.seeFullBtn}
              onPress={onSwitchToVenueTab}
              activeOpacity={0.7}
            >
              <Text style={[styles.seeFullBtnText, { color: tierTheme.accent }]}>
                Gérer la fiche
              </Text>
              <Ionicons name="arrow-forward" size={13} color={tierTheme.accent} />
            </TouchableOpacity>
          </View>

          <View style={styles.venueRow}>
            {imgUri ? (
              <Image source={{ uri: imgUri }} style={styles.venueImg} />
            ) : (
              <View style={[styles.venueImgPlaceholder, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <Ionicons name="restaurant-outline" size={26} color={theme.textMuted} />
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
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {activity.reviewsCount && activity.reviewsCount > 0 ? activity.rating || 0 : 0} ({activity.reviewsCount || 0})
                  </Text>
                </View>
                <Text style={{ color: tierTheme.accent, fontWeight: '800', fontSize: 12.5 }}>
                  {activity.price} DT
                </Text>
              </View>
            </View>
          </View>

          {/* Bouton Proéminent : Voir comme un client (Pilule pleine aux couleurs du palier) */}
          <TouchableOpacity
            style={[
              styles.previewClientBtn,
              { backgroundColor: tierTheme.accent },
            ]}
            onPress={() => onPreviewPress(activity)}
            activeOpacity={0.85}
          >
            <View style={styles.previewBtnLeft}>
              <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
              <Text style={styles.previewClientBtnText}>
                Voir comme un client
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* 3b. Carte de Fidélité Digitale (5+1) */}
      {activity && (
        <TouchableOpacity
          style={[
            styles.loyaltyBanner,
            { backgroundColor: theme.cardBg },
            getPremiumCardShadow(isDark),
            activity.loyaltyProgram?.isActive && { borderColor: tierTheme.border },
          ]}
          onPress={onLoyaltyPress}
          activeOpacity={0.82}
        >
          <View style={styles.loyaltyLeft}>
            <View
              style={[
                styles.loyaltyIconCircle,
                {
                  backgroundColor: activity.loyaltyProgram?.isActive
                    ? tierTheme.accent
                    : isDark ? '#1E293B' : '#F1F5F9',
                },
              ]}
            >
              <Ionicons
                name={activity.loyaltyProgram?.isActive ? 'ribbon' : 'ribbon-outline'}
                size={18}
                color={activity.loyaltyProgram?.isActive ? '#FFFFFF' : tierTheme.accent}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.loyaltyTitle, { color: theme.textMain }]}>
                {activity.loyaltyProgram?.isActive
                  ? 'Carte de Fidélité Active'
                  : 'Créer une Carte de Fidélité (5+1)'}
              </Text>
              <Text style={[styles.loyaltySub, { color: theme.textMuted }]} numberOfLines={1}>
                {activity.loyaltyProgram?.isActive
                  ? `${activity.loyaltyProgram.rewardLabel} · ${activity.loyaltyProgram.requiredStamps} tampons`
                  : 'Fidélisez vos clients : ex. 5 visites = 6ème offert'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={tierTheme.accent} />
        </TouchableOpacity>
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
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.9,
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
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  venueImgPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 16,
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
  previewClientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  previewBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewClientBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  loyaltyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  loyaltyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  loyaltyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loyaltyTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  loyaltySub: {
    fontSize: 11.5,
    marginTop: 2,
  },
});
