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
import { usePreferences } from '../../context/AppPreferencesContext';
import { getActivityLocalizedText } from '../../services/activityService';
import type { Activity, ActivityPromotion } from '../../types';

export interface PromoBannerCardProps {
  activity: Activity;
  promotion: ActivityPromotion;
  onPress: (activity: Activity) => void;
  width?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Format bannière panoramique (~88% de la largeur de l'écran)
export const DEFAULT_PROMO_BANNER_WIDTH = Math.min(SCREEN_WIDTH - 44, 350);

/**
 * Carte Bannière Promotionnelle style "#SpecialForYou" :
 * 1. Image 100% Full-Bleed couvrant TOUTE la carte
 * 2. Dégradé de noir horizontal (gauche vers droite) pour lisibilité parfaite
 * 3. Textes en blanc (Offre limitée, Titre, Chiffre géant %)
 * 4. Bouton "Claim / Profiter" en bas à droite
 */
export const PromoBannerCard: React.FC<PromoBannerCardProps> = ({
  activity,
  promotion,
  onPress,
  width = DEFAULT_PROMO_BANNER_WIDTH,
}) => {
  const { language, t } = usePreferences();

  const localizedPlaceName = getActivityLocalizedText(activity, 'name', language as any);

  const imageUri =
    activity.image ||
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';

  const discountVal = promotion.discountPercent || 40;

  // Libellé de l'offre
  const offerTitle =
    promotion.promoLabel ||
    (promotion.targetItem
      ? `Offre sur ${promotion.targetItem}`
      : 'Get Special Offer');

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(activity)}
      style={[styles.bannerCard, { width }]}
      accessibilityRole="button"
      accessibilityLabel={`Promotion ${discountVal}% chez ${localizedPlaceName}`}
    >
      {/* ── 1. IMAGE COUVRANT 100% DE LA CARTE ── */}
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* ── 2. DÉGRADÉ DE NOIR (DE GAUCHE VERS DROITE) ── */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.94)',
          'rgba(0, 0, 0, 0.82)',
          'rgba(0, 0, 0, 0.42)',
          'rgba(0, 0, 0, 0.08)',
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Dégradé bas supplémentaire léger pour asseoir le bouton Claim */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.45)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomShadowGradient}
      />

      {/* ── 3. CONTENU SUPERPOSÉ ── */}
      <View style={styles.contentContainer}>
        {/* Côté Gauche : Textes & Remise choc */}
        <View style={styles.leftContent}>
          {/* Pillule "Limited time!" */}
          <View style={styles.limitedPill}>
            <Text style={styles.limitedPillText}>
              {t('limitedTimePill')}
            </Text>
          </View>

          {/* Titre de l'offre */}
          <Text style={styles.offerTitle} numberOfLines={1}>
            {offerTitle}
          </Text>

          {/* Bloc remise géante : "Up to / Jusqu'à" + Gros Chiffre + Pastille % */}
          <View style={styles.discountRow}>
            <Text style={styles.upToText}>
              {t('upToDiscount')}
            </Text>
            <View style={styles.numberWithPercent}>
              <Text style={styles.bigDiscountNumber}>{discountVal}</Text>
              <View style={styles.percentBadge}>
                <Text style={styles.percentBadgeText}>%</Text>
              </View>
            </View>
          </View>

          {/* Nom du restaurant et période de validité */}
          <Text style={styles.placeSubtitle} numberOfLines={1}>
            {localizedPlaceName} {promotion.validUntil ? `· ${promotion.validUntil}` : `· ${activity.city || 'Sfax'}`}
          </Text>
        </View>

        {/* Côté Droit : Bouton "Claim" en bas à droite */}
        <View style={styles.rightContent}>
          <View style={styles.claimButton}>
            <Text style={styles.claimButtonText}>
              {t('claimDeal')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    height: 172,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
    marginVertical: 4,
  },
  bottomShadowGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 10,
  },
  leftContent: {
    flex: 1.35,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  limitedPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  limitedPillText: {
    color: '#09090B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: 2,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 1,
  },
  upToText: {
    color: '#E4E4E7',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  numberWithPercent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bigDiscountNumber: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  percentBadge: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    marginTop: 2,
  },
  percentBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  placeSubtitle: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rightContent: {
    flex: 0.85,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 14,
    paddingBottom: 14,
  },
  claimButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 7.5,
    borderRadius: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});

export default PromoBannerCard;
