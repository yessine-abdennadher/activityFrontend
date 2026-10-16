import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import { PromoBannerCard, DEFAULT_PROMO_BANNER_WIDTH } from './PromoBannerCard';
import { PromoDetailModal } from './PromoDetailModal';
import type { Activity } from '../../types';
import type { ThemeColors } from '../../theme/theme';

export interface PartnerPromosSectionProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  theme?: ThemeColors;
}

const CARD_INTERVAL = DEFAULT_PROMO_BANNER_WIDTH + 14;

export const PartnerPromosSection: React.FC<PartnerPromosSectionProps> = ({
  activities,
  onSelectActivity,
  theme: customTheme,
}) => {
  const { theme: ctxTheme, isDark, t } = usePreferences();
  const theme = customTheme || ctxTheme;

  // État de sélection d'une promotion pour le modal détaillé
  const [selectedPromoActivity, setSelectedPromoActivity] = useState<Activity | null>(null);

  // Index de la page courante pour les dots de pagination carrousel
  const [activeIndex, setActiveIndex] = useState(0);

  // Filtrer les activités ayant une promotion active
  const promoActivities = activities.filter(
    (act) => act.promotion && act.promotion.isPromo
  );

  // Si aucune promo n'est encore enregistrée dans la base, alimenter avec 3 démos basées sur les établissements réels
  const displayList = promoActivities.length > 0
    ? promoActivities
    : activities.slice(0, 4).map((act, idx) => ({
        ...act,
        promotion: {
          isPromo: true,
          discountPercent: idx === 0 ? 40 : idx === 1 ? 30 : idx === 2 ? 25 : 20,
          promoLabel:
            idx === 0
              ? 'Get Special Offer · Menu Duo & Boissons'
              : idx === 1
              ? '1 Pizza Achetée = 1 Boisson Offerte'
              : idx === 2
              ? 'Formule Goûter Gourmand à 7 DT au lieu de 11 DT'
              : '-20% sur toute l\'addition du soir',
          targetItem: idx === 1 ? 'Pizzas & Boissons' : idx === 2 ? 'Formule Goûter' : undefined,
          validUntil:
            idx === 0
              ? 'Jusqu’au 31 Oct'
              : idx === 1
              ? 'Ce week-end'
              : idx === 2
              ? 'Valable 48h'
              : 'Jusqu’à dimanche',
        },
      }));

  if (displayList.length === 0) return null;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / CARD_INTERVAL);
    if (index >= 0 && index < displayList.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── EN-TÊTE DE SECTION OFFRES SPÉCIALES ── */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconBadge}>
            <Ionicons name="pricetag" size={16} color="#EF4444" />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              {t('specialOffersTitle')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              {t('specialOffersSubtitle')}
            </Text>
          </View>
        </View>
      </View>

      {/* ── CARROUSEL HORIZONTAL DES BANNIÈRES PROMO ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
        snapToInterval={CARD_INTERVAL}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {displayList.map((act) => {
          const promo = act.promotion;
          if (!promo) return null;

          return (
            <PromoBannerCard
              key={`promo-${act.id}`}
              activity={act}
              promotion={promo}
              onPress={(selected) => setSelectedPromoActivity(selected)}
            />
          );
        })}
      </ScrollView>

      {/* ── DOTS DE PAGINATION CARROUSEL (POINT ACTIF ROUGE/CORAIL) ── */}
      {displayList.length > 1 && (
        <View style={styles.dotsContainer}>
          {displayList.map((_, idx) => (
            <View
              key={`dot-${idx}`}
              style={[
                styles.dot,
                idx === activeIndex
                  ? styles.activeDot
                  : [
                      styles.inactiveDot,
                      { backgroundColor: isDark ? '#3F3F46' : '#E4E4E7' },
                    ],
              ]}
            />
          ))}
        </View>
      )}

      {/* ── MODAL DÉTAILLÉ SANS BOUTON FERMER (SCROLLABLEMODAL) ── */}
      <PromoDetailModal
        visible={selectedPromoActivity !== null}
        activity={selectedPromoActivity}
        promotion={selectedPromoActivity?.promotion || null}
        onClose={() => setSelectedPromoActivity(null)}
        onViewEstablishment={(act) => {
          setSelectedPromoActivity(null);
          onSelectActivity(act);
        }}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
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
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
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
  scrollList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: '#EF4444',
  },
  inactiveDot: {
    width: 6,
  },
});

export default PartnerPromosSection;
