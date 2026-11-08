import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../../types';
import { ThemeColors } from '../../theme/theme';
import { activityActionService } from '../../services/activityActionService';

interface ActivityDetailHeroProps {
  activity: Activity;
  localizedName: string;
  localizedCity: string;
  isFavorite: boolean;
  isDark: boolean;
  theme: ThemeColors;
  onBack: () => void;
  onShare?: () => void;
  onToggleFavorite: (id: string) => void;
}

export const ActivityDetailHero: React.FC<ActivityDetailHeroProps> = ({
  activity,
  localizedName,
  localizedCity,
  isFavorite,
  isDark,
  theme,
  onBack,
  onShare,
  onToggleFavorite,
}) => {
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      activityActionService.shareActivity({
        name: localizedName,
        city: localizedCity,
        price: activity.price,
        rating: activity.rating,
        reviewsCount: activity.reviewsCount,
      });
    }
  };
  return (
    <View style={styles.hero}>
      <Image
        accessibilityLabel={localizedName}
        accessibilityRole="image"
        source={{ uri: activity.imageUrl || activity.image }}
        style={styles.heroImage}
      />
      <View style={styles.heroShade} />

      {/* Top Floating Action Buttons */}
      <View style={styles.topActions}>
        <TouchableOpacity
          accessibilityLabel="Retour"
          accessibilityRole="button"
          onPress={onBack}
          style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)' }]}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={theme.textMain} />
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity
            accessibilityLabel="Partager"
            accessibilityRole="button"
            onPress={handleShare}
            style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            accessibilityRole="button"
            onPress={() => onToggleFavorite(activity.id)}
            style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)' }]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#EF4444' : theme.textMain}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Bottom Location & Title */}
      <View style={styles.heroText}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#FFFFFF" />
          <Text style={styles.location}>
            {localizedCity} · {activity.distance}
          </Text>
        </View>
        <Text style={styles.heroTitle} numberOfLines={2}>
          {localizedName}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hero: {
    height: 330,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  topActions: {
    position: 'absolute',
    top: 48,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  heroText: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  location: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
});
