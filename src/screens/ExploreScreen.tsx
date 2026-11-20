import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { getLocalizedCategories } from '../constants/categories';
import { GoogleMapView } from '../components/GoogleMapView';
import {
  ExploreFilterState,
  INITIAL_EXPLORE_FILTERS,
  filterActivities,
} from '../components/explore/exploreFilters';
import { ExploreHeader } from '../components/explore/ExploreHeader';
import { ExploreFilterBar } from '../components/explore/ExploreFilterBar';
import { ExploreResultsList } from '../components/explore/ExploreResultsList';
import type { Activity } from '../types';

interface ExploreScreenProps {
  activities: Activity[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onOpenMap?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isLoading?: boolean;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  activities,
  favorites,
  onToggleFavorite,
  onSelectActivity,
  onLoadMore,
  hasMore,
  isLoadingMore,
  isLoading = false,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const [filters, setFilters] = useState<ExploreFilterState>(INITIAL_EXPLORE_FILTERS);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const categories = useMemo(() => getLocalizedCategories(language), [language]);

  const exploreResults = useMemo(
    () => filterActivities(activities, filters),
    [activities, filters]
  );

  const handleUpdateFilters = (next: Partial<ExploreFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* En-tête avec Switch Liste / Carte & compteur */}
        <ExploreHeader
          title={t('exploreTitle')}
          count={exploreResults.length}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          theme={theme}
          language={language}
          isRTL={isRTL}
        />

        {/* Barre de filtres (Recherche, Catégories, Budget, Distance, Reset) */}
        <ExploreFilterBar
          filters={filters}
          onChangeFilters={handleUpdateFilters}
          categories={categories}
          theme={theme}
          isDark={isDark}
          language={language}
          isRTL={isRTL}
          t={t}
        />

        {/* Vue Carte ou Vue Liste */}
        {viewMode === 'map' ? (
          <View style={styles.mapContainer}>
            <GoogleMapView
              activities={exploreResults}
              onSelectActivity={onSelectActivity}
              embedded
            />
          </View>
        ) : (
          <ExploreResultsList
            activities={exploreResults}
            favorites={favorites}
            isLoading={isLoading}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            theme={theme}
            language={language}
            isRTL={isRTL}
            t={t}
            onSelectActivity={onSelectActivity}
            onToggleFavorite={onToggleFavorite}
            onLoadMore={onLoadMore}
          />
        )}
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
  mapContainer: {
    marginTop: 14,
    overflow: 'hidden',
  },
});
