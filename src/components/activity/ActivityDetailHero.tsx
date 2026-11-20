import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
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
  const { width: screenWidth } = useWindowDimensions();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const fallbackUri =
    activity.imageUrl ||
    activity.image ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

  const photosList =
    Array.isArray(activity.photos) && activity.photos.length > 0
      ? activity.photos
      : [fallbackUri];

  const hasMultiplePhotos = photosList.length > 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (slide !== activePhotoIndex && slide >= 0 && slide < photosList.length) {
      setActivePhotoIndex(slide);
    }
  };

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
      {/* Carrousel d'images horizontal ou image unique */}
      {hasMultiplePhotos ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.carouselContainer}
        >
          {photosList.map((uri, idx) => (
            <Image
              key={`${uri}-${idx}`}
              source={{ uri }}
              style={[styles.heroImage, { width: screenWidth }]}
              resizeMode="cover"
              accessibilityLabel={`${localizedName} - Photo ${idx + 1}`}
              accessibilityRole="image"
            />
          ))}
        </ScrollView>
      ) : (
        <Image
          accessibilityLabel={localizedName}
          accessibilityRole="image"
          source={{ uri: photosList[0] }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      )}

      {/* Dégradé sombre pour lisibilité */}
      <View style={styles.heroShade} pointerEvents="none" />

      {/* Boutons d'action supérieurs (Retour, Partager, Favori) */}
      <View style={styles.topActions}>
        <TouchableOpacity
          accessibilityLabel="Retour"
          accessibilityRole="button"
          onPress={onBack}
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)' },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={theme.textMain} />
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity
            accessibilityLabel="Partager"
            accessibilityRole="button"
            onPress={handleShare}
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)' },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            accessibilityRole="button"
            onPress={() => onToggleFavorite(activity.id)}
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)' },
            ]}
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

      {/* Indicateur de pagination photos si carrousel actif */}
      {hasMultiplePhotos && (
        <View style={styles.photoCountBadge} pointerEvents="none">
          <Ionicons name="images-outline" size={13} color="#FFFFFF" />
          <Text style={styles.photoCountText}>
            {activePhotoIndex + 1} / {photosList.length}
          </Text>
        </View>
      )}

      {/* Titre & Localisation au bas du Hero */}
      <View style={styles.heroText} pointerEvents="none">
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

      {/* Points de pagination discrets si multi-photos */}
      {hasMultiplePhotos && (
        <View style={styles.paginationDots} pointerEvents="none">
          {photosList.map((_, idx) => (
            <View
              key={`dot-${idx}`}
              style={[
                styles.dot,
                idx === activePhotoIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  hero: {
    height: 330,
    position: 'relative',
  },
  carouselContainer: {
    width: '100%',
    height: '100%',
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
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
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
  photoCountBadge: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    zIndex: 10,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroText: {
    position: 'absolute',
    bottom: 28,
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
  paginationDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});
