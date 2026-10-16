import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Animated, Easing } from 'react-native';
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

/** Real Ionicons icon with a smooth looping pulse animation. */
const AnimatedPowerIcon: React.FC<{ off: boolean }> = ({ off }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: off ? 600 : 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: off ? 600 : 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, off]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, off ? 1.1 : 1.25] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [off ? 0.45 : 0.85, 1] });

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Ionicons
        name={off ? 'flash-off' : 'bulb'}
        size={16}
        color={off ? '#DC2626' : '#F59E0B'}
      />
    </Animated.View>
  );
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  theme: customTheme,
  isFavorite,
  onPress,
  onToggleFavorite,
}) => {
  const { language, theme: ctxTheme, electricityAlertActive } = usePreferences();
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

  // Calcul dynamique de l'état de la lumière en fonction des votes récents des personnes
  const powerState = useMemo(() => {
    if (!electricityAlertActive) return null;
    const reports = activity.powerReports;
    if (reports && (reports.yesVotes > 0 || reports.noVotes > 0)) {
      if (reports.noVotes > reports.yesVotes) {
        return {
          status: 'off',
          label: language === 'ar' ? `انقطاع (${reports.noVotes})` : `Coupure (${reports.noVotes})`,
        };
      }
      return {
        status: 'on',
        label: language === 'ar' ? `إنارة (${reports.yesVotes})` : `Lumière (${reports.yesVotes})`,
      };
    }
    if (activity.powerBackupMode !== false) {
      return {
        status: 'on',
        label: language === 'ar' ? 'إنارة وكهرباء' : 'Lumière active',
      };
    }
    return null;
  }, [electricityAlertActive, activity.powerReports, activity.powerBackupMode, language]);

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

          {/* Center: Mode Lampe Allumée ou Coupure signalée par rapport aux votes */}
          {powerState && <AnimatedPowerIcon off={powerState.status === 'off'} />}

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <View style={styles.locationTag}>
              <Ionicons name="location" size={13} color="#FCE7F3" />
              <Text style={styles.locationText}>
                {localizedCity} · {activity.distance}
              </Text>
            </View>

            {/* Horaires d'ouverture / fermeture */}
            <View style={styles.hoursTag}>
              <Ionicons name="time-outline" size={12} color="#10B981" />
              <Text style={styles.hoursText}>
                {activity.openingTime || '09:00'} - {activity.closingTime || '23:00'}
              </Text>
            </View>

            {/* Promo exclusive Partenaire Pro */}
            {activity.promotion?.isPromo && (
              <View style={styles.promoBadge}>
                <Ionicons name="sparkles" size={11} color="#FFFFFF" />
                <Text style={styles.promoBadgeText}>
                  {activity.promotion.promoLabel || `-${activity.promotion.discountPercent}% PROMO`}
                </Text>
              </View>
            )}
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

          {/* Événement live (Partenaire Pro) */}
          {Boolean(activity.events && activity.events.length > 0) && (
            <View style={[styles.pillMeta, { backgroundColor: '#FDF2F8', borderColor: '#F472B6', borderWidth: 1 }]}>
              <Ionicons name="musical-notes" size={13} color="#DB2777" />
              <Text style={[styles.metaText, { color: '#BE185D', fontWeight: '700' }]}>
                {activity.events![0].title}
              </Text>
            </View>
          )}

          {powerState && <AnimatedPowerIcon off={powerState.status === 'off'} />}
        </View>

        {/* Right meta: Rating & Reviews */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingNumber}>
            {(activity.reviewsCount === 0 || !activity.reviewsCount) ? 0 : (activity.rating ?? 0)}
          </Text>
          {activity.reviewsCount !== undefined && (
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
  lampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(254, 243, 199, 0.95)',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  lampGlowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lampBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  hoursTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hoursText: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '700',
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#DC2626',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default ActivityCard;
