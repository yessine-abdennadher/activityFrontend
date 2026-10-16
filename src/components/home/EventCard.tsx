import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { usePreferences } from '../../context/AppPreferencesContext';
import { getActivityLocalizedText } from '../../services/activityService';
import type { Activity, ActivityEvent } from '../../types';
import type { ThemeColors } from '../../theme/theme';

export interface EventCardProps {
  activity: Activity;
  event: ActivityEvent;
  onPress: (activity: Activity, event: ActivityEvent) => void;
  theme?: ThemeColors;
  width?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Largeur compacte idéale pour les affiches de soirées (~165px)
export const DEFAULT_EVENT_CARD_WIDTH = Math.floor((SCREEN_WIDTH - 44) / 2);

/**
 * Formatage épuré de la date et de l'heure (ex: "15 Oct 2026" ou "Ce soir • 21:00")
 */
function formatEventDate(dateStr?: string, timeStr?: string, language: string = 'fr'): string {
  const time = timeStr ? ` • ${timeStr}` : '';

  if (!dateStr || dateStr.toLowerCase().includes('ce soir')) {
    return language === 'ar' ? `الليلة${time}` : `Ce soir${time}`;
  }

  return `${dateStr}${time}`;
}

/**
 * Formatage épuré du prix (ex: "20 DT" ou "Entrée libre")
 */
function formatEventPrice(price?: number, language: string = 'fr'): string {
  if (price && price > 0) {
    return `${price} DT`;
  }
  return language === 'ar' ? 'دخول حر' : 'Entrée libre';
}

/**
 * Carte Soirée style Live Concert Poster :
 * - Image 100% Full-Bleed qui couvre toute la carte (du haut jusqu'en bas)
 * - Voile sombre en bas pour sublimer le texte
 * - Titre de l'événement en gras blanc superposé
 * - Date en gris clair
 * - Prix en dessous
 */
export const EventCard: React.FC<EventCardProps> = ({
  activity,
  event,
  onPress,
  width = DEFAULT_EVENT_CARD_WIDTH,
}) => {
  const { language } = usePreferences();

  // Image spécifique de l'événement en priorité, sinon celle du lieu
  const imageUri =
    event.image ||
    activity.image ||
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';

  const dateLabel = formatEventDate(event.date, event.time, language);
  const priceLabel = formatEventPrice(event.price, language);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(activity, event)}
      style={[styles.cardContainer, { width }]}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${dateLabel}, ${priceLabel}`}
    >
      {/* ── 100% FULL-BLEED IMAGE COUVRANT TOUTE LA CARTE ── */}
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* ── VOILE SOMBRE EN BAS (POUR LISIBILITÉ DU TEXTE) ── */}
      <View style={styles.bottomScrim} />

      {/* ── TEXTE SUPERPOSÉ EN BAS (TITRE, DATE, PRIX) ── */}
      <View style={styles.infoOverlay}>
        {/* Titre de la soirée / Artiste en blanc bold */}
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Date de l'événement */}
        <Text style={styles.eventDate} numberOfLines={1}>
          {dateLabel}
        </Text>

        {/* Prix / Entrée libre */}
        <Text style={styles.eventPrice} numberOfLines={1}>
          {priceLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 228,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 6,
  },
  bottomScrim: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.43)',
  },
  infoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  eventDate: {
    color: '#D1D5DB',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventPrice: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default EventCard;
