import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import { getActivityLocalizedText } from '../../services/activityService';
import { ScrollableModal } from '../ui/ScrollableModal';
import type { Activity, ActivityPromotion } from '../../types';
import type { ThemeColors } from '../../theme/theme';

export interface PromoDetailModalProps {
  visible: boolean;
  activity: Activity | null;
  promotion: ActivityPromotion | null;
  onClose: () => void;
  onViewEstablishment: (activity: Activity) => void;
  theme?: ThemeColors;
}

/**
 * Interface détaillée d'un Bon Plan / Promo Partenaire.
 * Utilise ScrollableModal : défilement haut/bas fluide, sans bouton fermer, geste vers le bas.
 */
export const PromoDetailModal: React.FC<PromoDetailModalProps> = ({
  visible,
  activity,
  promotion,
  onClose,
  onViewEstablishment,
  theme: customTheme,
}) => {
  const { theme: ctxTheme, language, isDark, t } = usePreferences();
  const theme = customTheme || ctxTheme;

  const [copiedCode, setCopiedCode] = useState(false);

  if (!activity || !promotion) return null;

  const establishmentName = getActivityLocalizedText(activity, 'name', language as any);
  const establishmentCity = getActivityLocalizedText(activity, 'city', language as any);
  const establishmentCategory = activity.category || 'Restaurant & Café';

  const promoImage =
    activity.image ||
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80';

  const discountVal = promotion.discountPercent || 20;
  const promoCode = `PROMO-${establishmentName.slice(0, 3).toUpperCase()}${discountVal}`;

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCall = () => {
    if (activity.phone) {
      Linking.openURL(`tel:${activity.phone}`).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    if (activity.whatsapp || activity.phone) {
      const num = (activity.whatsapp || activity.phone || '').replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(
        `Bonjour, je souhaite profiter de votre offre "${promotion.promoLabel}" (-${discountVal}%) à ${establishmentName}.`
      );
      Linking.openURL(`https://wa.me/${num}?text=${msg}`).catch(() => {});
    }
  };

  const handleDirections = () => {
    const query = encodeURIComponent(`${establishmentName}, ${establishmentCity}, Tunisie`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url).catch(() => {});
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🏷️ Bon Plan exclusif: -${discountVal}% chez ${establishmentName} (${establishmentCity}) ! Retrouvez l'offre sur l'application ActivityTN.`,
      });
    } catch {
      // Ignorer annulation
    }
  };

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      height="88%"
      theme={theme}
      contentContainerStyle={styles.modalContent}
    >
      {/* ── BANNIÈRE PHOTO DE L'OFFRE ── */}
      <View style={styles.heroCard}>
        <Image
          source={{ uri: promoImage }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroGradient} />

        {/* Bouton Partage en haut à droite */}
        <TouchableOpacity
          style={styles.floatingShareBtn}
          onPress={handleShare}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Partager"
        >
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Badge Réduction Flottant Géant */}
        <View style={styles.discountBadgeFloating}>
          <Ionicons name="flame" size={16} color="#FFFFFF" />
          <Text style={styles.discountBadgeText}>-{discountVal}%</Text>
        </View>
      </View>

      {/* ── TITRE DE LA PROMOTION & TYPE ── */}
      <View style={styles.promoHeaderBlock}>
        <View style={styles.proPill}>
          <Ionicons name="sparkles" size={12} color="#F59E0B" />
          <Text style={styles.proPillText}>
            {t('exclusiveOfferBadge')}
          </Text>
        </View>

        <Text style={[styles.promoMainTitle, { color: theme.textMain }]}>
          {promotion.promoLabel}
        </Text>

        {promotion.promoType === 'item' && Boolean(promotion.targetItem) && (
          <Text style={styles.targetItemTag}>
            🎯 Valable spécifiquement sur : {promotion.targetItem}
          </Text>
        )}
      </View>

      {/* ── BON / COUPON DÉTACHABLE AVEC CODE ── */}
      <View style={[styles.couponBox, { backgroundColor: isDark ? '#1E293B' : '#FEF2F2', borderColor: isDark ? '#334155' : '#FECACA' }]}>
        <View style={styles.couponLeft}>
          <Text style={[styles.couponLabel, { color: isDark ? '#CBD5E1' : '#991B1B' }]}>
            {language === 'ar' ? 'رمز القسيمة للتخفيض' : 'Code réduction à présenter :'}
          </Text>
          <Text style={[styles.couponCodeText, { color: isDark ? '#F87171' : '#DC2626' }]}>
            {promoCode}
          </Text>
          <Text style={[styles.couponValidity, { color: isDark ? '#94A3B8' : '#B91C1C' }]}>
            {promotion.validUntil ? `Valable jusqu'au ${promotion.validUntil}` : 'Valable dès maintenant sur place'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.copyBtn, { backgroundColor: copiedCode ? '#10B981' : '#EF4444' }]}
          onPress={handleCopyCode}
          activeOpacity={0.8}
        >
          <Ionicons
            name={copiedCode ? 'checkmark' : 'copy-outline'}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.copyBtnText}>
            {copiedCode ? (language === 'ar' ? 'تم النسخ' : 'Copié !') : (language === 'ar' ? 'نسخ' : 'Copier')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── SECTION ÉTABLISSEMENT / RESTAURANT HÔTE ── */}
      <View
        style={[
          styles.hostSection,
          {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          },
        ]}
      >
        <View style={styles.hostSectionHeader}>
          <View style={styles.hostBadgeIcon}>
            <Ionicons name="storefront" size={14} color="#EA580C" />
          </View>
          <Text style={[styles.hostSectionTitle, { color: theme.textMain }]}>
            {t('venueLocationTitle')}
          </Text>
        </View>

        {/* Carte miniature de l'établissement */}
        <View style={styles.hostCardContent}>
          <Image
            source={{
              uri:
                activity.image ||
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
            }}
            style={styles.hostImage}
          />
          <View style={styles.hostDetails}>
            <View style={styles.hostNameRow}>
              <Text
                style={[styles.hostNameText, { color: theme.textMain }]}
                numberOfLines={1}
              >
                {establishmentName}
              </Text>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            </View>

            <Text
              style={[styles.hostCategoryText, { color: theme.textMuted }]}
              numberOfLines={1}
            >
              {establishmentCategory} · {establishmentCity}
            </Text>

            {/* Note & avis */}
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingNumber}>
                {activity.rating ? activity.rating.toFixed(1) : '4.8'}
              </Text>
              <Text style={[styles.ratingCount, { color: theme.textMuted }]}>
                ({activity.reviewsCount || 120} avis)
              </Text>
            </View>
          </View>
        </View>

        {/* Bouton pour consulter la fiche complète du restaurant */}
        <TouchableOpacity
          style={styles.viewRestaurantBtn}
          activeOpacity={0.85}
          onPress={() => {
            onClose();
            onViewEstablishment(activity);
          }}
        >
          <Ionicons name="restaurant" size={16} color="#FFFFFF" />
          <Text style={styles.viewRestaurantText}>
            {language === 'ar' ? 'عرض قائمة وتفاصيل المطعم' : 'Consulter la fiche du restaurant'}
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── BOUTONS D'ACTION RAPIDE (CONTACT / RÉSERVATION) ── */}
      <View style={styles.actionsRow}>
        {Boolean(activity.phone) && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.callBtn]}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>
              {language === 'ar' ? 'اتصال' : 'Appeler'}
            </Text>
          </TouchableOpacity>
        )}

        {Boolean(activity.whatsapp || activity.phone) && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.whatsappBtn]}
            onPress={handleWhatsApp}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.mapsBtn]}
          onPress={handleDirections}
          activeOpacity={0.85}
        >
          <Ionicons name="navigate" size={16} color="#38BDF8" />
          <Text style={[styles.actionBtnText, { color: '#38BDF8' }]}>
            {language === 'ar' ? 'الموقع' : 'Itinéraire'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollableModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    paddingBottom: 32,
  },
  heroCard: {
    height: 190,
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#18181B',
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(24, 24, 27, 0.25)',
  },
  floatingShareBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(24, 24, 27, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
  },
  discountBadgeFloating: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoHeaderBlock: {
    marginBottom: 16,
  },
  proPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  proPillText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
  },
  promoMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    marginBottom: 4,
  },
  targetItemTag: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 4,
  },
  couponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 18,
    gap: 12,
  },
  couponLeft: {
    flex: 1,
  },
  couponLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  couponCodeText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 3,
  },
  couponValidity: {
    fontSize: 11,
    fontWeight: '500',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  hostSection: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: 18,
  },
  hostSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  hostBadgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hostCardContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  hostImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  hostDetails: {
    flex: 1,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  hostNameText: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  hostCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },
  ratingCount: {
    fontSize: 11,
  },
  viewRestaurantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  viewRestaurantText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  callBtn: {
    backgroundColor: '#0F172A',
  },
  whatsappBtn: {
    backgroundColor: '#16A34A',
  },
  mapsBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default PromoDetailModal;
