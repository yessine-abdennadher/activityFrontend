import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Activity } from '../types';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { getActivityLocalizedText } from '../services/activityService';

interface ExploreActivityCardProps {
  activity: Activity;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const ExploreActivityCard: React.FC<ExploreActivityCardProps> = ({
  activity,
  isFavorite,
  onPress,
  onToggleFavorite,
}) => {
  const { theme, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const title = getActivityLocalizedText(activity, 'name', language);
  const locationText = getActivityLocalizedText(activity, 'location', language);

  const priceLabel =
    activity.price === 0
      ? t('freePrice')
      : language === 'ar'
      ? `${activity.price} د.ت`
      : `${activity.price} DT`;

  const metaSubtitle = [
    activity.duration || '1-2h',
    activity.distance ? activity.distance : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Vignette Image carrée aux coins arrondis */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: activity.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Contenu central */}
      <View style={[styles.content, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text
          style={[
            styles.title,
            { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.locationText,
            { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' },
          ]}
          numberOfLines={1}
        >
          {locationText || activity.city}
        </Text>

        {metaSubtitle.length > 0 && (
          <Text
            style={[
              styles.metaText,
              { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={1}
          >
            {metaSubtitle}
          </Text>
        )}

        <Text
          style={[
            styles.priceText,
            { color: theme.primary, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {priceLabel}
        </Text>
      </View>

      {/* Bouton Favoris / Cœur en haut à droite (ou à gauche en RTL) */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={(e) => {
          e.stopPropagation?.();
          onToggleFavorite();
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Ajouter aux favoris"
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={22}
          color={isFavorite ? '#EF4444' : theme.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  imageWrapper: {
    width: 82,
    height: 82,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.85,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
