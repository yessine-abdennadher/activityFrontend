import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../theme/theme';
import {
  PartnerActivityItem,
  PartnerStats,
  PartnerTier,
} from '../../../types';
import {
  getPartnerTierTheme,
  getPremiumCardShadow,
} from '../../../utils/partnerTierTheme';
import {
  buildDynamicOptimizationTip,
  computePerformanceMetrics,
} from '../../../components/partner/performance/performanceMetrics';
import { PerformanceHeroCard } from '../../../components/partner/performance/PerformanceHeroCard';
import { PerformanceKpiGrid } from '../../../components/partner/performance/PerformanceKpiGrid';
import { PerformanceProSection } from '../../../components/partner/performance/PerformanceProSection';
import { PerformancePremiumSection } from '../../../components/partner/performance/PerformancePremiumSection';

interface PartnerPerformanceTabProps {
  stats: PartnerStats;
  activities: PartnerActivityItem[];
  effectiveTier?: PartnerTier;
  isProPartner?: boolean;
  isPremiumPartner?: boolean;
  refreshing?: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onRefresh: () => void | Promise<void>;
  onUpgradePress?: (target: 'pro' | 'premium') => void;
  onPromoPress?: (activity: PartnerActivityItem) => void;
  onEventPress?: (activity: PartnerActivityItem) => void;
}

export const PartnerPerformanceTab: React.FC<PartnerPerformanceTabProps> = ({
  stats,
  activities,
  effectiveTier: propEffectiveTier,
  isProPartner = false,
  isPremiumPartner = false,
  refreshing = false,
  theme,
  isDark,
  onRefresh,
  onUpgradePress,
  onPromoPress,
  onEventPress,
}) => {
  const [period, setPeriod] = useState<'30d' | 'all'>('30d');

  const isPremium = propEffectiveTier === 'premium' || isPremiumPartner;
  const isPro = isPremium || propEffectiveTier === 'pro' || isProPartner;
  const effectiveTier: PartnerTier = isPremium ? 'premium' : isPro ? 'pro' : 'standard';

  const activePeriod: '30d' | 'all' = !isPro && period === 'all' ? '30d' : period;
  const mainActivity = activities[0] ?? null;

  const tierTheme = getPartnerTierTheme(effectiveTier, isDark);
  const premiumShadow = getPremiumCardShadow(isDark);
  const subtleBorder = isDark ? '#1E293B' : '#E2E8F0';

  const metrics = useMemo(
    () => computePerformanceMetrics(stats, activities, activePeriod),
    [stats, activities, activePeriod],
  );

  const dynamicTip = useMemo(
    () => buildDynamicOptimizationTip({ metrics, isPro, isPremium }),
    [metrics, isPro, isPremium],
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
    >
      {/* En-tête */}
      <View style={styles.headerBox}>
        <Text style={[styles.mainTitle, { color: theme.textMain }]}>
          Performances
        </Text>
      </View>

      {/* Sélecteur de période */}
      <View
        style={[
          styles.periodSwitch,
          {
            backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
            borderColor: subtleBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.periodTab,
            activePeriod === '30d' && [
              styles.periodTabActive,
              { backgroundColor: theme.cardBg },
            ],
          ]}
          onPress={() => setPeriod('30d')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.periodTabText,
              {
                color: activePeriod === '30d' ? theme.textMain : theme.textMuted,
                fontWeight: activePeriod === '30d' ? '800' : '600',
              },
            ]}
          >
            30 derniers jours
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodTab,
            activePeriod === 'all' && [
              styles.periodTabActive,
              { backgroundColor: theme.cardBg },
            ],
          ]}
          onPress={() => {
            if (!isPro) {
              onUpgradePress?.('pro');
            } else {
              setPeriod('all');
            }
          }}
          activeOpacity={0.8}
        >
          {!isPro && <Ionicons name="lock-closed" size={11} color="#EA580C" />}
          <Text
            style={[
              styles.periodTabText,
              {
                color: activePeriod === 'all' ? theme.textMain : theme.textMuted,
                fontWeight: activePeriod === 'all' ? '800' : '600',
              },
            ]}
          >
            Cumul global {!isPro ? '(Pro)' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Carte Héro Résumé */}
      <PerformanceHeroCard
        effectiveTier={effectiveTier}
        viewsCount={metrics.viewsCount}
        directContacts={metrics.directContacts}
        mapsCount={metrics.mapsCount}
        conversionRate={metrics.conversionRate}
        isPro={isPro}
        isPremium={isPremium}
        isDark={isDark}
      />

      {/* Grille KPI 2x2 */}
      <PerformanceKpiGrid
        whatsappCount={metrics.whatsappCount}
        phoneCount={metrics.phoneCount}
        hasReviews={metrics.hasReviews}
        formattedRating={metrics.formattedRating}
        totalReviews={stats.totalReviews}
        activeLoyaltyCount={metrics.activeLoyaltyCount}
        effectiveTier={effectiveTier}
        theme={theme}
        isDark={isDark}
      />

      {/* Section PRO : Conversion & Promotions */}
      <PerformanceProSection
        isPro={isPro}
        conversionRate={metrics.conversionRate}
        directContacts={metrics.directContacts}
        viewsCount={metrics.viewsCount}
        activePromoActivity={metrics.activePromoActivity}
        mainActivity={mainActivity}
        theme={theme}
        isDark={isDark}
        onPromoPress={onPromoPress}
        onUpgradePress={onUpgradePress}
      />

      {/* Section PREMIUM : Visibilité & Événements VIP */}
      <PerformancePremiumSection
        isPremium={isPremium}
        totalEventsCount={metrics.totalEventsCount}
        hasFeaturedVenue={metrics.hasFeaturedVenue}
        mainActivity={mainActivity}
        theme={theme}
        isDark={isDark}
        onEventPress={onEventPress}
        onUpgradePress={onUpgradePress}
      />

      {/* Conseil d'Optimisation Hamla */}
      <View
        style={[
          styles.tipBox,
          {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderColor: tierTheme.border,
          },
          premiumShadow,
        ]}
      >
        <View style={[styles.tipIconWrap, { backgroundColor: tierTheme.softBg }]}>
          <Ionicons name="bulb" size={18} color={tierTheme.accent} />
        </View>
        <View style={styles.tipContent}>
          <Text style={[styles.tipTitle, { color: theme.textMain }]}>
            {dynamicTip.title}
          </Text>
          <Text style={[styles.tipBody, { color: theme.textMuted }]}>
            {dynamicTip.body}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 12,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
  },
  periodSwitch: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  periodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  periodTabActive: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  periodTabText: {
    fontSize: 12.5,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
    gap: 3,
  },
  tipTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  tipBody: {
    fontSize: 12,
    lineHeight: 17.5,
    fontWeight: '500',
  },
});
