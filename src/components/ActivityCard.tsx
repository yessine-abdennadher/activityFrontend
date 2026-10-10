import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../types';
import { ThemeColors } from '../theme/theme';
import { usePreferences } from '../context/AppPreferencesContext';
import { getActivityLocalizedText } from '../services/activityService';
import { getLocalizedCategories } from '../constants/categories';

export interface ActivityCardProps {
  activity: Activity;
  theme?: ThemeColors;
  isFavorite: boolean;
  onPress?: (activity?: Activity) => void;
  onToggleFavorite?: (id?: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  theme: customTheme,
  isFavorite,
  onPress,
  onToggleFavorite,
}) => {
  const { language, theme: ctxTheme } = usePreferences();
  const theme = customTheme || ctxTheme;

  // Localized texts based on active user language
  const localizedTitle = getActivityLocalizedText(activity, 'name', language as any);
  const localizedCity = getActivityLocalizedText(activity, 'city', language as any);

  // Localized category label
  const localizedCategoryName = useMemo(() => {
    if (!activity.category) return '';
    const localizedList = getLocalizedCategories(language);
    const match = localizedList.find(
      (c) => c.id.toLowerCase() === activity.category.toLowerCase() ||
             c.nameAr === activity.category ||
             c.nameFr === activity.category ||
             c.nameEn === activity.category
    );
    return match ? match.name : activity.category;
  }, [activity.category, language]);

  // Localized price label
  const freeLabel = language === 'ar' ? 'مجاني' : language === 'fr' ? 'Gratuit' : 'Free';
  const perPersonLabel = language === 'ar' ? '/شخص' : language === 'fr' ? '/pers' : '/person';

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={() => onPress?.(activity)}
      style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
    >
      {/* ── Image & Badges Top Section ─────────────────────────────── */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: activity.image }} style={styles.image} />
        <View style={styles.gradientScrim} />

        <View style={styles.topBadgesRow}>
          {/* Favorite heart button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite?.(activity.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#1E1B4B'}
            />
          </TouchableOpacity>

          {/* Price Badge */}
          <View style={[styles.priceBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.priceText}>
              {activity.price === 0 ? freeLabel : `${activity.price} DT`}
            </Text>
            {activity.price > 0 && <Text style={styles.priceUnit}>{perPersonLabel}</Text>}
          </View>
        </View>

        {/* Bottom Image Overlay Details */}
        <View style={styles.overlayContent}>
          <View style={styles.locationTag}>
            <Ionicons name="location" size={13} color="#FCE7F3" />
            <Text style={styles.locationText}>
              {localizedCity} · {activity.distance}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {localizedTitle}
          </Text>
        </View>
      </View>

      {/* ── Card Info Footer ───────────────────────────────────────── */}
      <View style={styles.footer}>
        {/* Left meta: Duration & Category */}
        <View style={styles.metaRow}>
          <View style={[styles.pillMeta, { backgroundColor: theme.iconBg }]}>
            <Ionicons name="time-outline" size={14} color={theme.primary} />
            <Text style={[styles.metaText, { color: theme.textMain }]}>{activity.duration}</Text>
          </View>

          {Boolean(localizedCategoryName) && (
            <View style={[styles.pillMeta, { backgroundColor: theme.iconBg }]}>
              <Ionicons name="sparkles-outline" size={13} color={theme.primary} />
              <Text style={[styles.metaText, { color: theme.textMain }]}>{localizedCategoryName}</Text>
            </View>
          )}
        </View>

        {/* Right meta: Rating & Reviews */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingNumber}>{activity.rating}</Text>
          {!!activity.reviewsCount && (
            <Text style={styles.reviewsCount}>({activity.reviewsCount})</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  imageContainer: {
    height: 205,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  favoriteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  priceUnit: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    zIndex: 10,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#FCE7F3',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
    textAlign: 'left',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ratingNumber: {
    color: '#D97706',
    fontWeight: '900',
    fontSize: 13,
  },
  reviewsCount: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ActivityCard;
