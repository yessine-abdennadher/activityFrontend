import React from 'react';
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
import type { Activity, ActivityEvent } from '../../types';
import type { ThemeColors } from '../../theme/theme';

export interface EventDetailModalProps {
  visible: boolean;
  activity: Activity | null;
  event: ActivityEvent | null;
  onClose: () => void;
  onViewEstablishment: (activity: Activity) => void;
  theme?: ThemeColors;
}

/**
 * Interface détaillée de la soirée / événement.
 * Utilise ScrollableModal : défilement haut/bas, swipe vers le bas pour fermer, sans bouton fermer.
 */
export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  visible,
  activity,
  event,
  onClose,
  onViewEstablishment,
  theme: customTheme,
}) => {
  const { theme: ctxTheme, language, isDark } = usePreferences();
  const theme = customTheme || ctxTheme;

  if (!activity || !event) return null;

  const establishmentName = getActivityLocalizedText(activity, 'name', language as any);
  const establishmentCity = getActivityLocalizedText(activity, 'city', language as any);
  const establishmentCategory = activity.category || 'Restaurant & Lounge';

  const eventImage =
    event.image ||
    activity.image ||
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80';

  const priceLabel =
    event.price && event.price > 0
      ? `${event.price} DT`
      : language === 'ar'
      ? 'دخول حر'
      : 'Entrée libre';

  // Format date et heure
  const dateLabel = event.date || (language === 'ar' ? 'هذا المساء' : 'Ce soir');
  const timeLabel = event.time || '21:00';

  const handleCall = () => {
    if (activity.phone) {
      Linking.openURL(`tel:${activity.phone}`).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    if (activity.whatsapp || activity.phone) {
      const num = (activity.whatsapp || activity.phone || '').replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(
        `Bonjour, je souhaite réserver pour la soirée "${event.title}" à ${establishmentName}.`
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
        message: `🎶 Soirée : ${event.title} à ${establishmentName} (${establishmentCity}) ! Retrouvez les détails sur l'application ActivityTN.`,
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
      {/* ── GRANDE BANNIÈRE IMMERSIVE DE L'ÉVÉNEMENT ── */}
      <View style={styles.heroCard}>
        <Image
          source={{ uri: eventImage }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroGradient} />

        {/* Bouton Partager en haut à droite */}
        <TouchableOpacity
          style={styles.floatingShareBtn}
          onPress={handleShare}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Partager"
        >
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Badge Ticket Flottant sur l'Image (Date & Heure) */}
        <View style={styles.ticketBanner}>
          <View style={styles.ticketBadgeLeft}>
            <Ionicons name="calendar" size={13} color="#FDE047" />
            <Text style={styles.ticketDateText}>{dateLabel}</Text>
          </View>
          <View style={styles.ticketBadgeRight}>
            <Ionicons name="time-outline" size={13} color="#FFFFFF" />
            <Text style={styles.ticketTimeText}>{timeLabel}</Text>
          </View>
        </View>
      </View>

      {/* ── LIGNE PRIX & CATÉGORIE ── */}
      <View style={styles.metaTopRow}>
        <View style={styles.pricePill}>
          <Ionicons name="pricetag" size={13} color="#10B981" />
          <Text style={styles.pricePillText}>{priceLabel}</Text>
        </View>

        <View style={styles.categoryPill}>
          <Ionicons name="musical-notes" size={13} color="#A855F7" />
          <Text style={styles.categoryPillText}>
            {event.category ? event.category.toUpperCase() : 'SOIRÉE & LIVE'}
          </Text>
        </View>
      </View>

      {/* ── TITRE PRINCIPAL DE LA SOIRÉE ── */}
      <Text style={[styles.eventMainTitle, { color: theme.textMain }]}>
        {event.title}
      </Text>

      {/* ── DESCRIPTION DE L'ÉVÉNEMENT ── */}
      <View style={styles.descSection}>
        <Text style={[styles.descTitle, { color: theme.textMain }]}>
          {language === 'ar' ? 'عن السهرة' : 'À propos de cette soirée'}
        </Text>
        <Text style={[styles.descText, { color: theme.textMuted }]}>
          {event.description ||
            'Ambiance festive garantie, musique en live et consommations au choix. Réservation conseillée pour garantir votre table.'}
        </Text>
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
            <Ionicons name="restaurant" size={14} color="#7C3AED" />
          </View>
          <Text style={[styles.hostSectionTitle, { color: theme.textMain }]}>
            {language === 'ar' ? 'مكان السهرة والمطعم المستضيف' : 'Lieu & Établissement Partenaire'}
          </Text>
        </View>

        {/* Carte miniature de l'établissement */}
        <View style={styles.hostCardContent}>
          <Image
            source={{
              uri:
                activity.image ||
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
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
          <Ionicons name="storefront" size={16} color="#FFFFFF" />
          <Text style={styles.viewRestaurantText}>
            {language === 'ar' ? 'عرض تفاصيل المطعم والقائمة الكاملة' : 'Consulter la fiche du restaurant'}
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── BOUTONS D'ACTION POUR LA SOIRÉE (RÉSERVATION & ITINÉRAIRE) ── */}
      <View style={styles.actionsRow}>
        {Boolean(activity.phone) && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.callBtn]}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>
              {language === 'ar' ? 'اتصال وحجز' : 'Appeler'}
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
    height: 200,
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
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
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
  },
  floatingShareBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
  },
  ticketBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ticketBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ticketDateText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  ticketBadgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  ticketTimeText: {
    color: '#FDE047',
    fontSize: 11.5,
    fontWeight: '800',
  },
  metaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  pricePillText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  categoryPillText: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  eventMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    marginBottom: 12,
  },
  descSection: {
    marginBottom: 18,
  },
  descTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 5,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
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
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
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
    backgroundColor: '#7C3AED',
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: '#7C3AED',
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

export default EventDetailModal;
