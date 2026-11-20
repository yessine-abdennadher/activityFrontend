import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import type { TranslationKey } from '../../constants/translations';
import type { ExploreFilterState } from './exploreFilters';

interface CategoryItem {
  id: string;
  name: string;
}

interface ExploreFilterBarProps {
  filters: ExploreFilterState;
  onChangeFilters: (next: Partial<ExploreFilterState>) => void;
  categories: CategoryItem[];
  theme: ThemeColors;
  isDark: boolean;
  language: string;
  isRTL: boolean;
  t: (key: TranslationKey) => string;
}

const MAIN_CATEGORY_KEYS = [
  'fun',
  'sport',
  'food',
  'outdoor',
  'creative',
  'couple',
  'friends',
];

export const ExploreFilterBar: React.FC<ExploreFilterBarProps> = ({
  filters,
  onChangeFilters,
  categories,
  theme,
  isDark,
  language,
  isRTL,
  t,
}) => {
  const { query, category, budget, distance } = filters;

  const hasActiveFilters = Boolean(category || budget || distance || query);

  return (
    <View style={styles.container}>
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
          size={19}
          color={theme.textSub}
          style={{ marginHorizontal: 8 }}
        />
        <TextInput
          value={query}
          onChangeText={(q) => onChangeFilters({ query: q })}
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
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeFilters({ query: '' })}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={18} color={theme.textSub} />
          </TouchableOpacity>
        )}
      </View>

      {/* Chips horizontaux : Catégories + Critères rapides */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.filtersRow,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {/* Option Toutes */}
        <TouchableOpacity
          onPress={() => onChangeFilters({ category: '' })}
          style={[
            styles.chip,
            {
              borderColor: category === '' ? theme.primary : theme.cardBorder,
              backgroundColor: category === '' ? theme.primary : theme.cardBg,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chipText,
              { color: category === '' ? '#FFFFFF' : theme.textMain },
            ]}
          >
            {t('all')}
          </Text>
        </TouchableOpacity>

        {/* Catégories principales */}
        {MAIN_CATEGORY_KEYS.map((catKey) => {
          const catObj = categories.find((c) => c.id === catKey);
          const label = catObj ? catObj.name : catKey;
          const isSelected = category === catKey;

          return (
            <TouchableOpacity
              key={catKey}
              onPress={() => onChangeFilters({ category: isSelected ? '' : catKey })}
              style={[
                styles.chip,
                {
                  borderColor: isSelected ? theme.primary : theme.cardBorder,
                  backgroundColor: isSelected ? theme.primary : theme.cardBg,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? '#FFFFFF' : theme.textMain },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Filtre Budget <= 30 DT */}
        <TouchableOpacity
          onPress={() => onChangeFilters({ budget: budget === '30' ? '' : '30' })}
          style={[
            styles.chip,
            {
              borderColor: budget === '30' ? theme.primary : theme.cardBorder,
              backgroundColor: budget === '30' ? theme.primary : theme.cardBg,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chipText,
              { color: budget === '30' ? '#FFFFFF' : theme.textMain },
            ]}
          >
            {t('budgetUnder30')}
          </Text>
        </TouchableOpacity>

        {/* Filtre Distance <= 5 km */}
        <TouchableOpacity
          onPress={() => onChangeFilters({ distance: distance === '5' ? '' : '5' })}
          style={[
            styles.chip,
            {
              borderColor: distance === '5' ? theme.primary : theme.cardBorder,
              backgroundColor: distance === '5' ? theme.primary : theme.cardBg,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chipText,
              { color: distance === '5' ? '#FFFFFF' : theme.textMain },
            ]}
          >
            {t('distanceUnder5')}
          </Text>
        </TouchableOpacity>

        {/* Réinitialiser les filtres si actifs */}
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={() =>
              onChangeFilters({
                query: '',
                category: '',
                budget: '',
                distance: '',
              })
            }
            style={[
              styles.chip,
              {
                borderColor: isDark ? '#475569' : '#CBD5E1',
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={14} color={theme.textMuted} />
            <Text style={[styles.chipText, { color: theme.textMuted }]}>
              {language === 'ar' ? 'إعادة ضبط' : 'Effacer'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 12,
  },
  searchBar: {
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  filtersRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
