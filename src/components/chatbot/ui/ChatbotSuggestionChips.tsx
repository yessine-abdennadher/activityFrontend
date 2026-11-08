/**
 * ChatbotSuggestionChips.tsx
 * Barre horizontale de suggestions rapides (Chips cliquables).
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../../context/AppPreferencesContext';

interface ChatbotSuggestionChipsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export const ChatbotSuggestionChips: React.FC<ChatbotSuggestionChipsProps> = ({
  suggestions,
  onSelectSuggestion,
}) => {
  const { theme, isDark, language } = usePreferences();
  const isRTL = language === 'ar';

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        contentContainerStyle={styles.content}
      >
        {suggestions.map((sug, idx) => {
          const isLocationChip =
            sug.includes('📍') ||
            sug.toLowerCase().includes('position') ||
            sug.toLowerCase().includes('gps') ||
            sug.toLowerCase().includes('autour') ||
            sug.toLowerCase().includes('ba7dheya') ||
            sug.toLowerCase().includes('قريب') ||
            sug.toLowerCase().includes('الموقع');

          const cleanText = sug.replace(/📍/g, '').trim();

          return (
            <TouchableOpacity
              key={`chip-${idx}-${cleanText.slice(0, 10)}`}
              style={[
                styles.chip,
                {
                  backgroundColor: isLocationChip
                    ? isDark
                      ? 'rgba(14, 165, 233, 0.18)'
                      : 'rgba(14, 165, 233, 0.08)'
                    : isDark
                    ? 'rgba(30, 41, 59, 0.85)'
                    : '#FFFFFF',
                  borderColor: isLocationChip ? theme.primary : theme.cardBorder,
                },
              ]}
              onPress={() => onSelectSuggestion(sug)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={cleanText}
            >
              <View style={[styles.chipInner, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {isLocationChip && (
                  <Ionicons
                    name="location-sharp"
                    size={13}
                    color={theme.primary}
                    style={{ marginHorizontal: 3 }}
                  />
                )}
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isLocationChip ? theme.primary : theme.textMain,
                      fontWeight: isLocationChip ? '700' : '600',
                    },
                  ]}
                >
                  {cleanText}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  chipInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
  },
});

