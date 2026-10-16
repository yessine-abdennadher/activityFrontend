import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import { getActivityLocalizedText } from '../../services/activityService';
import type { Activity } from '../../types';
import type { ThemeColors } from '../../theme/theme';

export interface PartnerPromosSectionProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  theme?: ThemeColors;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROMO_CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.72, 280);

export const PartnerPromosSection: React.FC<PartnerPromosSectionProps> = ({
  activities,
  onSelectActivity,
  theme: customTheme,
}) => {
  const { theme: ctxTheme, language } = usePreferences();
  const theme = customTheme || ctxTheme;

  // Filtrer les activités ayant une promotion active
  const promoActivities = activities.filter(
    (act) => act.promotion && act.promotion.isPromo
  );

  // Si aucune promo n'est encore enregistrée dans la base, alimenter avec 3 démos basées sur les établissements réels
  const displayList = promoActivities.length > 0
    ? promoActivities
    : activities.slice(1, 4).map((act, idx) => ({
        ...act,
        promotion: {
          isPromo: true,
          discountPercent: idx === 0 ? 20 : idx === 1 ? 30 : 15,
          promoLabel: idx === 0 ? '-20% sur toute l\'addition ☕' : idx === 1 ? '1 Pizza achetée = 1 boisson offerte 🍕' : 'Formule Goûter à 7 DT au lieu de 11 DT 🍰',
        },
      }));

  if (displayList.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* En-tête de section */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconBadge}>
            <Ionicons name="flame" size={17} color="#EA580C" />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              {language === 'ar' ? 'عروض وتخفيضات حصرية 🏷️' : language === 'fr' ? 'Bons Plans & Promos Pro' : 'Deals & Discounts'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              {language === 'ar' ? 'تخفيضات شركاء برو' : 'Réductions directes de nos Partenaires Pro'}
            </Text>
          </View>
        </View>

        <View style={styles.proTag}>
          <Text style={styles.proTagText}>PRO ⭐</Text>
        </View>
      </View>

      {/* Carrousel horizontal des cartes promotions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {displayList.map((act) => {
          const promo = act.promotion;
          if (!promo) return null;

          const localizedPlaceName = getActivityLocalizedText(act, 'name', language as any);

          return (
            <TouchableOpacity
              key={`promo-${act.id}`}
              activeOpacity={0.88}
              onPress={() => onSelectActivity(act)}
              style={[
                styles.promoCard,
                {
                  width: PROMO_CARD_WIDTH,
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Promotion ${promo.discountPercent}% chez ${localizedPlaceName}`}
            >
              {/* Photo avec badge réduction éclatant */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: act.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />

                {/* Badge Réduction Rouge/Orange vif */}
                <View style={styles.discountBadge}>
                  <Ionicons name="pricetag" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.discountBadgeText}>
                    -{promo.discountPercent}%
                  </Text>
                </View>

                {/* Nom du café ou restaurant */}
                <View style={styles.placeOverlay}>
                  <Text numberOfLines={1} style={styles.placeNameText}>
                    {localizedPlaceName}
                  </Text>
                </View>
              </View>

              {/* Détail de l'offre */}
              <View style={styles.cardContent}>
                {(promo as any).promoType === 'item' && Boolean((promo as any).targetItem) && (
                  <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '800', color: '#EA580C', marginBottom: 2 }}>
                    🎯 {(promo as any).targetItem}
                  </Text>
                )}
                <Text numberOfLines={2} style={[styles.promoLabel, { color: theme.textMain }]}>
                  {promo.promoLabel}
                </Text>

                <View style={styles.actionRow}>
                  <View style={styles.validityBadge}>
                    <Ionicons name="flash" size={12} color="#EA580C" />
                    <Text style={styles.validityText}>
                      {language === 'ar' ? 'صالح الآن' : 'Offre active'}
                    </Text>
                  </View>

                  <View style={styles.seePromoBtn}>
                    <Text style={styles.seePromoText}>
                      {language === 'ar' ? 'استفد' : 'Profiter'}
                    </Text>
                    <Ionicons name="chevron-forward" size={13} color="#EA580C" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  proTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(234, 88, 12, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.4)',
  },
  proTagText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  scrollList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  promoCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 9,
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  placeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  placeNameText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  cardContent: {
    padding: 12,
  },
  promoLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.12)',
  },
  validityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validityText: {
    color: '#EA580C',
    fontSize: 11.5,
    fontWeight: '700',
  },
  seePromoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seePromoText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default PartnerPromosSection;
