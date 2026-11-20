import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';

interface ExploreHeaderProps {
  title: string;
  count: number;
  viewMode: 'list' | 'map';
  onToggleViewMode: (mode: 'list' | 'map') => void;
  theme: ThemeColors;
  language: string;
  isRTL: boolean;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  title,
  count,
  viewMode,
  onToggleViewMode,
  theme,
  language,
  isRTL,
}) => {
  const countLabel =
    language === 'ar'
      ? `${count} نتيجة متوفرة`
      : count > 1
      ? `${count} résultats disponibles`
      : `${count} résultat disponible`;

  return (
    <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View>
        <Text
          style={[
            styles.screenTitle,
            { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {title}
        </Text>
        <Text style={[styles.resultCountText, { color: theme.textMuted }]}>
          {countLabel}
        </Text>
      </View>

      {/* Toggle compact Liste / Carte */}
      <View
        style={[
          styles.viewToggle,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.viewToggleBtn,
            viewMode === 'list' && { backgroundColor: theme.primary },
          ]}
          onPress={() => onToggleViewMode('list')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="list"
            size={16}
            color={viewMode === 'list' ? '#FFFFFF' : theme.textMuted}
          />
          <Text
            style={[
              styles.viewToggleText,
              { color: viewMode === 'list' ? '#FFFFFF' : theme.textMuted },
            ]}
          >
            {language === 'ar' ? 'قائمة' : 'Liste'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewToggleBtn,
            viewMode === 'map' && { backgroundColor: theme.primary },
          ]}
          onPress={() => onToggleViewMode('map')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="map"
            size={16}
            color={viewMode === 'map' ? '#FFFFFF' : theme.textMuted}
          />
          <Text
            style={[
              styles.viewToggleText,
              { color: viewMode === 'map' ? '#FFFFFF' : theme.textMuted },
            ]}
          >
            {language === 'ar' ? 'خريطة' : 'Carte'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
  },
  resultCountText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  viewToggleText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
