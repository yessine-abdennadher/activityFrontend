import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import type { ThemeColors } from '../../theme/theme';

interface CategoryItem {
  id: string;
  name: string;
}

interface MapCategoryFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  localizedCategories: CategoryItem[];
  theme: ThemeColors;
  isDark: boolean;
  language: string;
}

export const MapCategoryFilterBar: React.FC<MapCategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  localizedCategories,
  theme,
  isDark,
  language,
}) => {
  if (categories.length <= 2) return null;

  const getCategoryLabel = (catKey: string) => {
    if (catKey === 'all') return language === 'ar' ? 'الكل' : 'Tout';
    const found = localizedCategories.find((c) => c.id === catKey);
    return found ? found.name : catKey;
  };

  return (
    <View
      style={[
        styles.filterBarWrapper,
        {
          backgroundColor: theme.cardBg,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBarContent}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const label = getCategoryLabel(cat);
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive
                    ? theme.primary
                    : isDark
                      ? '#1E293B'
                      : '#F1F5F9',
                  borderColor: isActive
                    ? theme.primary
                    : isDark
                      ? '#334155'
                      : '#E2E8F0',
                },
              ]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isActive ? '#FFFFFF' : theme.textMain },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterBarWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  filterBarContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
