import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';

export type NotificationCategory = 'all' | 'unread' | 'alerts' | 'offers_reviews' | 'management';

export interface FilterChipItem {
  key: NotificationCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

interface NotificationFilterChipsProps {
  chips: FilterChipItem[];
  activeFilter: NotificationCategory;
  theme: ThemeColors;
  isDark: boolean;
  onSelectFilter: (filter: NotificationCategory) => void;
}

export const NotificationFilterChips: React.FC<NotificationFilterChipsProps> = ({
  chips,
  activeFilter,
  theme,
  isDark,
  onSelectFilter,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      {chips.map((chip) => {
        const isActive = activeFilter === chip.key;
        return (
          <TouchableOpacity
            key={chip.key}
            onPress={() => onSelectFilter(chip.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: isActive
                  ? theme.primary
                  : isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : '#FFFFFF',
                borderColor: isActive ? theme.primary : theme.cardBorder,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={chip.icon}
              size={14}
              color={isActive ? '#FFFFFF' : theme.textMuted}
            />
            <Text
              style={[
                styles.filterChipText,
                {
                  color: isActive ? '#FFFFFF' : theme.textMain,
                  fontWeight: isActive ? '800' : '600',
                },
              ]}
            >
              {chip.label}
            </Text>
            {Boolean(chip.badge && chip.badge > 0) && (
              <View
                style={[
                  styles.chipBadge,
                  { backgroundColor: isActive ? '#FFFFFF' : theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.chipBadgeText,
                    { color: isActive ? theme.primary : '#FFFFFF' },
                  ]}
                >
                  {chip.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chipsContainer: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  chipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
