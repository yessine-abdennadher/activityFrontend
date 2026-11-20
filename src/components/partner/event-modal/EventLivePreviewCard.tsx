import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';

interface EventLivePreviewCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  date: string;
  time: string;
  price: string;
  isFreeEntry: boolean;
  description: string;
  theme: ThemeColors;
  isDark: boolean;
}

export const EventLivePreviewCard: React.FC<EventLivePreviewCardProps> = ({
  icon,
  title,
  date,
  time,
  price,
  isFreeEntry,
  description,
  theme,
  isDark,
}) => {
  return (
    <View style={styles.previewBox}>
      <Text style={[styles.previewHeading, { color: theme.textMuted }]}>
        Aperçu de votre annonce sur Hamla :
      </Text>
      <View
        style={[
          styles.previewEventCard,
          {
            backgroundColor: isDark ? '#2E1065' : '#FAF5FF',
            borderColor: isDark ? '#7E22CE' : '#E9D5FF',
          },
        ]}
      >
        <View style={styles.previewEventHeader}>
          <View style={styles.previewEventIcon}>
            <Ionicons name={icon} size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.previewEventTitle, { color: isDark ? '#F5F3FF' : '#581C87' }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text style={[styles.previewEventMeta, { color: isDark ? '#E9D5FF' : '#6B21A8' }]}>
              {date || 'Samedi soir'} · {time || '21:00'} ·{' '}
              {isFreeEntry ? 'Entrée libre' : `${price} DT`}
            </Text>
          </View>
        </View>
        {Boolean(description.trim()) && (
          <Text
            style={[styles.previewEventDesc, { color: isDark ? '#DDD6FE' : '#7E22CE' }]}
            numberOfLines={2}
          >
            {description.trim()}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewBox: {
    gap: 6,
  },
  previewHeading: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewEventCard: {
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  previewEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewEventIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEventTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  previewEventMeta: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  previewEventDesc: {
    fontSize: 11.5,
    paddingLeft: 42,
    lineHeight: 16,
  },
});
