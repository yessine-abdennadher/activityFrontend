import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Activity } from '../types';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import ActivityCard from '../components/ActivityCard';
import type { RecommendationFilters } from './RecommendationFlowScreen';
import { getRecommendations, localizeActivity } from '../services/activityService';

interface RecommendationResultsScreenProps {
  activities?: Activity[];
  filters: RecommendationFilters;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onNavigate: (screen: string) => void;
}

export const RecommendationResultsScreen: React.FC<RecommendationResultsScreenProps> = ({
  activities = [],
  filters,
  favorites,
  onToggleFavorite,
  onSelectActivity,
  onNavigate,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'distance'>('rating');
  const [results, setResults] = useState<Activity[]>(activities);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    getRecommendations(filters, sortBy)
      .then((recommendedActivities) => {
        if (!active) return;
        setResults(recommendedActivities.map((a) => localizeActivity(a, language as any)));
      })
      .catch((error) => {
        console.warn('[RecommendationResultsScreen] Erreur backend recommendations:', error);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, sortBy, language]);

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && !k.endsWith('Max') && !k.endsWith('Min'));

  const SORT_OPTIONS: Array<{ key: 'rating' | 'price' | 'distance'; icon: keyof typeof Ionicons.glyphMap; label: string }> = [
    {
      key: 'rating',
      icon: 'star-outline',
      label: t('topRated'),
    },
    {
      key: 'price',
      icon: 'cash-outline',
      label: t('cheapest'),
    },
    {
      key: 'distance',
      icon: 'navigate-outline',
      label: t('nearest'),
    },
  ];

  const resultsCountText = `${results.length} ${t('matchesFound')}`;
  const headerTitleText = t('customIdeasForYou');
  const headerSubtitleText = t('recommendationResultsSubtitle');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} {...({ backgroundColor: theme.bg } as any)} />

      {/* Modern Floating Top Bar (No Heavy Header) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => onNavigate('recommendationFlow')}
          style={[
            styles.circleButton,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(2,132,199,0.08)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(2,132,199,0.15)',
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.textMain} />
        </TouchableOpacity>

        {/* Results Counter Pill */}
        <View style={[styles.resultBadge, { backgroundColor: isDark ? 'rgba(56,189,248,0.15)' : '#E0F2FE' }]}>
          <Ionicons name="sparkles" size={14} color={theme.primary} />
          <Text style={[styles.resultBadgeText, { color: theme.primary }]}>
            {resultsCountText}
          </Text>
        </View>

        {/* Filter edit shortcut */}
        <TouchableOpacity
          onPress={() => onNavigate('recommendationFlow')}
          style={[
            styles.circleButton,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(2,132,199,0.08)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(2,132,199,0.15)',
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={19} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.textMain }]}>{headerTitleText}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {headerSubtitleText}
          </Text>
        </View>

        {/* Active Filter Chips Scrollable */}
        {activeFilters.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {activeFilters.map(([k, v]) => (
              <View
                key={k}
                style={[
                  styles.activeChip,
                  {
                    backgroundColor: isDark ? 'rgba(56,189,248,0.14)' : '#E0F2FE',
                    borderColor: isDark ? 'rgba(56,189,248,0.25)' : 'rgba(2,132,199,0.2)',
                  },
                ]}
              >
                <Ionicons name="checkmark-circle" size={13} color={theme.primary} />
                <Text style={[styles.activeChipText, { color: theme.primary }]}>{String(v)}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Modern Segmented Sort Bar */}
        <View
          style={[
            styles.sortContainer,
            {
              backgroundColor: isDark ? 'rgba(14,30,56,0.6)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(2,132,199,0.1)',
            },
          ]}
        >
          {SORT_OPTIONS.map((s) => {
            const active = sortBy === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => setSortBy(s.key)}
                activeOpacity={0.8}
                style={[
                  styles.sortTab,
                  active && {
                    backgroundColor: theme.primary,
                    shadowColor: theme.primary,
                    shadowOpacity: isDark ? 0.4 : 0.25,
                  },
                ]}
              >
                <Ionicons
                  name={s.icon}
                  size={14}
                  color={active ? '#FFFFFF' : theme.textMuted}
                />
                <Text
                  style={[
                    styles.sortTabText,
                    {
                      color: active ? '#FFFFFF' : theme.textMuted,
                      fontWeight: active ? '800' : '600',
                    },
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Results List or Loading / Empty State */}
        {isLoading ? (
          <View style={{ paddingVertical: 48, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ marginTop: 14, color: theme.textMuted, fontSize: 14, fontWeight: '600' }}>
              {t('calculatingRecommendations')}
            </Text>
          </View>
        ) : results.length > 0 ? (
          <View style={styles.list}>
            {results.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isFavorite={favorites.includes(activity.id)}
                onToggleFavorite={(id) => onToggleFavorite(id || activity.id)}
                onPress={(act) => onSelectActivity(act || activity)}
              />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? 'rgba(14,30,56,0.6)' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(2,132,199,0.1)',
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: isDark ? 'rgba(56,189,248,0.12)' : '#E0F2FE' },
              ]}
            >
              <Ionicons name="search-outline" size={44} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
              {t('noResults')}
            </Text>
            <Text style={[styles.emptyHint, { color: theme.textMuted }]}>
              {t('emptyRecommendationHint')}
            </Text>
            <TouchableOpacity
              style={[
                styles.modifyFiltersBtn,
                {
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                },
              ]}
              onPress={() => onNavigate('recommendationFlow')}
              activeOpacity={0.85}
            >
              <Ionicons name="options-outline" size={18} color="#FFF" />
              <Text style={styles.modifyFiltersBtnText}>{t('modifySearchFilters')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
  },
  resultBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'right',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'right',
    lineHeight: 18,
  },
  chipsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingBottom: 14,
  },
  activeChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sortContainer: {
    flexDirection: 'row-reverse',
    borderRadius: 18,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    gap: 4,
  },
  sortTab: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,


  },
  sortTabText: {
    fontSize: 12,
  },
  list: {
    gap: 16,
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 28,
    alignItems: 'center',
    marginTop: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,


  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modifyFiltersBtn: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,


  },
  modifyFiltersBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
