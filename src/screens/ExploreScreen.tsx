import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { getLocalizedCategories } from '../constants/categories';
import { ExploreActivityCard } from '../components/ExploreActivityCard';
import type { Activity } from '../types';

interface ExploreScreenProps {
  activities: Activity[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onOpenMap: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  activities,
  favorites,
  onToggleFavorite,
  onSelectActivity,
  onOpenMap,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) => {
  const { theme, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreCategory, setExploreCategory] = useState('');
  const [exploreBudget, setExploreBudget] = useState('');
  const [exploreDistance, setExploreDistance] = useState('');

  const exploreResults = useMemo(() => {
    return activities.filter((activity) => {
      const q = exploreQuery.toLowerCase().trim();
      const queryMatches =
        !q ||
        `${activity.name} ${activity.city} ${activity.category} ${activity.description || ''}`
          .toLowerCase()
          .includes(q);

      const categoryMatches = !exploreCategory || activity.category === exploreCategory;
      const budgetMatches =
        !exploreBudget ||
        (exploreBudget === '30'
          ? activity.price <= 30
          : exploreBudget === '10'
          ? activity.price <= 10
          : true);

      const distanceMatches =
        !exploreDistance ||
        (activity.distanceKm !== undefined &&
          (exploreDistance === '5'
            ? activity.distanceKm <= 5
            : exploreDistance === '10'
            ? activity.distanceKm <= 10
            : true));

      return queryMatches && categoryMatches && budgetMatches && distanceMatches;
    });
  }, [activities, exploreQuery, exploreCategory, exploreBudget, exploreDistance]);

  const categories = useMemo(() => getLocalizedCategories(language), [language]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text
          style={[
            styles.screenTitle,
            { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {t('exploreTitle')}
        </Text>

        {/* Barre de recherche */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.textSub}
            style={{ marginHorizontal: 8 }}
          />
          <TextInput
            value={exploreQuery}
            onChangeText={setExploreQuery}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={theme.textSub}
            style={[
              styles.searchInput,
              {
                color: theme.textMain,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          />
          {exploreQuery.length > 0 && (
            <TouchableOpacity onPress={() => setExploreQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={theme.textSub} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres de catégories et critères */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.exploreFilters,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          {/* Option Toutes */}
          <TouchableOpacity
            onPress={() => setExploreCategory('')}
            style={[
              styles.exploreFilter,
              {
                borderColor: theme.cardBorder,
                backgroundColor: exploreCategory === '' ? theme.primary : theme.cardBg,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: exploreCategory === '' ? '#FFFFFF' : theme.textMain,
                fontWeight: '700',
              }}
            >
              {t('all')}
            </Text>
          </TouchableOpacity>

          {/* Catégories principales */}
          {['fun', 'sport', 'food', 'outdoor', 'creative', 'couple', 'friends'].map((catKey) => {
            const catObj = categories.find((c) => c.id === catKey);
            const label = catObj ? catObj.name : catKey;
            const isSelected = exploreCategory === catKey;

            return (
              <TouchableOpacity
                key={catKey}
                onPress={() => setExploreCategory(isSelected ? '' : catKey)}
                style={[
                  styles.exploreFilter,
                  {
                    borderColor: theme.cardBorder,
                    backgroundColor: isSelected ? theme.primary : theme.cardBg,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: isSelected ? '#FFFFFF' : theme.textMain,
                    fontWeight: '700',
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Filtres rapides budget & distance */}
          <TouchableOpacity
            onPress={() => setExploreBudget(exploreBudget === '30' ? '' : '30')}
            style={[
              styles.exploreFilter,
              {
                borderColor: theme.cardBorder,
                backgroundColor: exploreBudget === '30' ? theme.primary : theme.cardBg,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: exploreBudget === '30' ? '#FFFFFF' : theme.textMain,
                fontWeight: '700',
              }}
            >
              {t('budgetUnder30')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setExploreDistance(exploreDistance === '5' ? '' : '5')}
            style={[
              styles.exploreFilter,
              {
                borderColor: theme.cardBorder,
                backgroundColor: exploreDistance === '5' ? theme.primary : theme.cardBg,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: exploreDistance === '5' ? '#FFFFFF' : theme.textMain,
                fontWeight: '700',
              }}
            >
              {t('distanceUnder5')}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bouton raccourci Carte interactive */}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onOpenMap}
          style={[
            styles.mapExploreButton,
            {
              borderColor: theme.primary,
              backgroundColor: `${theme.primary}12`,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={20} color={theme.primary} />
          <Text style={{ color: theme.primary, fontWeight: '800' }}>
            {t('nearbyMap')}
          </Text>
        </TouchableOpacity>

        {/* Liste des résultats */}
        <View style={styles.resultsContainer}>
          {exploreResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {t('noResults')}
              </Text>
            </View>
          ) : (
            exploreResults.map((act) => (
              <ExploreActivityCard
                key={act.id}
                activity={act}
                isFavorite={favorites.includes(act.id)}
                onPress={() => onSelectActivity(act)}
                onToggleFavorite={() => onToggleFavorite(act.id)}
              />
            ))
          )}

          {/* Bouton de chargement paginé (+20 activités) */}
          {hasMore && onLoadMore && exploreResults.length > 0 && (
            <TouchableOpacity
              style={{
                paddingVertical: 14,
                paddingHorizontal: 20,
                backgroundColor: `${theme.primary}12`,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: `${theme.primary}30`,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 16,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                gap: 8,
              }}
              onPress={onLoadMore}
              disabled={isLoadingMore}
              activeOpacity={0.8}
            >
              {isLoadingMore ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <Ionicons name="arrow-down-circle-outline" size={18} color={theme.primary} />
                  <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 14 }}>
                    {language === 'ar'
                      ? 'عرض المزيد من الأنشطة (+20)'
                      : language === 'en'
                      ? 'Load more activities (+20)'
                      : "Charger plus d'activités (+20)"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  container: {
    padding: 20,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
  },
  searchBar: {
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  exploreFilters: {
    gap: 8,
    paddingTop: 14,
  },
  exploreFilter: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapExploreButton: {
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: 24,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resultsContainer: {
    marginTop: 24,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
