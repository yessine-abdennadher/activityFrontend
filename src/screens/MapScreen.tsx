import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Activity } from '../types';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { getLocalizedCategories } from '../constants/categories';
import { GoogleMapView } from '../components/GoogleMapView';
import { MapHeader } from '../components/map/MapHeader';
import { MapCategoryFilterBar } from '../components/map/MapCategoryFilterBar';

interface MapScreenProps {
  activities: Activity[];
  onNavigate: (screen: string) => void;
  onSelectActivity: (activity: Activity) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  activities,
  onNavigate,
  onSelectActivity,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const localizedCategories = useMemo(
    () => getLocalizedCategories(language),
    [language]
  );

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(activities.map((a) => a.category).filter(Boolean))
    );
    return ['all', ...unique];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'all') return activities;
    return activities.filter((a) => a.category === selectedCategory);
  }, [activities, selectedCategory]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      {/* Header SafeArea modulaire */}
      <MapHeader
        title={t('nearbyMap')}
        count={filteredActivities.length}
        topInset={insets.top}
        theme={theme}
        language={language}
        isRTL={isRTL}
        onBack={() => onNavigate('home')}
      />

      {/* Barre de filtrage par catégorie modulaire */}
      <MapCategoryFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        localizedCategories={localizedCategories}
        theme={theme}
        isDark={isDark}
        language={language}
      />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <GoogleMapView
          activities={filteredActivities}
          onSelectActivity={onSelectActivity}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
