import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import { getActivityLocalizedText } from '../../services/activityService';
import type { Activity } from '../../types';
import type { ThemeColors } from '../../theme/theme';
import { FONTS } from '../../theme/typography';

export interface CompactActivityCardProps {
  activity: Activity;
  isFavorite: boolean;
  onPress?: (activity: Activity) => void;
  onToggleFavorite?: (id: string) => void;
  theme?: ThemeColors;
  width?: number;
  showDistance?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Two cards displayed per screen width with proper margin & gutter
export const DEFAULT_COMPACT_CARD_WIDTH = Math.floor((SCREEN_WIDTH - 44) / 2);

export const CompactActivityCard: React.FC<CompactActivityCardProps> = ({
  activity,
  isFavorite,
  onPress,
  onToggleFavorite,
  width = DEFAULT_COMPACT_CARD_WIDTH,
  showDistance = false,
}) => {
  const { language } = usePreferences();

  const localizedName = getActivityLocalizedText(activity, 'name', language as any);

  // Format clean price text
  const formatPrice = () => {
    if (activity.price === 0) {
      return language === 'ar' ? 'مجاني' : language === 'fr' ? 'Gratuit' : 'Free';
    }
    if (activity.price !== undefined && activity.price !== null) {
      return `${activity.price} DT`;
    }
    if (activity.priceTag) {
      return activity.priceTag;
    }
    return language === 'ar' ? 'مجاني' : 'Gratuit';
  };

  const imageUri =
    activity.imageUrl ||
    activity.image ||
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress && onPress(activity)}
      style={[
        styles.cardContainer,
        {
          width,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${localizedName}, ${formatPrice()}`}
    >
      {/* 100% Full-bleed background image */}
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* ── DÉGRADÉ DE NOIR PROGRESSIF (HAUT TRANSPARENT, BAS NOIR) ── */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(0, 0, 0, 0.1)',
          'rgba(0, 0, 0, 0.65)',
          'rgba(0, 0, 0, 0.94)',
        ]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Heart Button (Coeur) top-right */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onToggleFavorite && onToggleFavorite(activity.id)}
        style={styles.heartButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={18}
          color={isFavorite ? '#EF4444' : '#FFFFFF'}
        />
      </TouchableOpacity>

      {/* Bottom Immersive Scrim Overlay (Nom + Prix sur dégradé noir) */}
      <View style={styles.bottomOverlay}>
        <View style={styles.pillRow}>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{formatPrice()}</Text>
          </View>
          {showDistance && Boolean(activity.distance) && (
            <View style={styles.distancePill}>
              <Ionicons name="location-sharp" size={10} color="#FDE047" />
              <Text style={styles.distanceText}>{activity.distance}</Text>
            </View>
          )}
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.title,
            language === 'ar' && { fontFamily: FONTS.arabicBold },
          ]}
        >
          {localizedName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 205,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A', // Nuit sombre neutre si chargement réseau
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 8,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 11,
    paddingBottom: 11,
    paddingTop: 8,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  pricePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.45)',
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(253, 224, 71, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.4)',
  },
  distanceText: {
    fontFamily: FONTS.interBold,
    color: '#FDE047',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  priceText: {
    fontFamily: FONTS.interBold,
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: FONTS.outfitBold,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default CompactActivityCard;
