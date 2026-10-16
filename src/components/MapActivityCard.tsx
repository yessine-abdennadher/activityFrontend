import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Activity } from '../types';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { getActivityLocalizedText } from '../services/activityService';
import { formatDistance } from '../services/googleMapsService';

export const getCategoryIconInfo = (
  category?: string
): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('cafe') || cat.includes('resto') || cat.includes('gastronomie')) {
    return { name: 'restaurant', color: '#F59E0B' };
  }
  if (cat.includes('sport') || cat.includes('fit')) {
    return { name: 'fitness', color: '#10B981' };
  }
  if (cat.includes('outdoor') || cat.includes('plein air') || cat.includes('nature') || cat.includes('beach')) {
    return { name: 'leaf', color: '#059669' };
  }
  if (cat.includes('creative') || cat.includes('art')) {
    return { name: 'color-palette', color: '#EC4899' };
  }
  if (cat.includes('couple') || cat.includes('romant')) {
    return { name: 'heart', color: '#EF4444' };
  }
  if (cat.includes('friend') || cat.includes('ami') || cat.includes('group')) {
    return { name: 'people', color: '#3B82F6' };
  }
  if (cat.includes('shop') || cat.includes('mall')) {
    return { name: 'cart', color: '#6366F1' };
  }
  if (cat.includes('fun') || cat.includes('game') || cat.includes('jeu') || cat.includes('divertissement')) {
    return { name: 'game-controller', color: '#8B5CF6' };
  }
  return { name: 'compass', color: '#0EA5E9' };
};

interface MapActivityCardProps {
  activity: Activity;
  isSelected?: boolean;
  distanceKm?: number;
  onPress: () => void;
}

export const MapActivityCard: React.FC<MapActivityCardProps> = ({
  activity,
  isSelected = false,
  distanceKm,
  onPress,
}) => {
  const { theme, language } = usePreferences();
  const { t } = useTranslation();

  const title = getActivityLocalizedText(activity, 'name', language);

  const priceLabel =
    activity.price === 0
      ? t('freePrice')
      : `${activity.price} DT`;

  return (
    <TouchableOpacity
      style={[
        styles.markerCard,
        {
          backgroundColor: theme.cardBg,
          borderColor: isSelected ? theme.primary : theme.cardBorder,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: activity.image }} style={styles.markerImage} />
      <Text style={[styles.markerTitle, { color: theme.textMain }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.markerMeta}>
        <Text style={[styles.markerDistance, { color: theme.primary }]}>
          {distanceKm !== undefined ? formatDistance(distanceKm) : ''}
        </Text>
        <Text style={[styles.markerPrice, { color: theme.textMuted }]}>
          {priceLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  markerCard: {
    width: 140,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    marginRight: 12,
  },
  markerImage: {
    width: 120,
    height: 75,
    borderRadius: 12,
    marginBottom: 6,
  },
  markerTitle: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  markerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  markerDistance: {
    fontSize: 11,
    fontWeight: '800',
  },
  markerPrice: {
    fontSize: 11,
    fontWeight: '700',
  },
});
