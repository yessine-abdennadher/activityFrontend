import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';
import { useTranslation } from '../../hooks/useTranslation';

interface ActivityBookingHubProps {
  phone?: string;
  whatsapp?: string;
  isFavorite: boolean;
  isDark: boolean;
  theme: ThemeColors;
  onCall: () => void;
  onWhatsApp: () => void;
  onOpenMapDirection: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
}

export const ActivityBookingHub: React.FC<ActivityBookingHubProps> = ({
  phone,
  isFavorite,
  isDark,
  theme,
  onCall,
  onWhatsApp,
  onOpenMapDirection,
  onShare,
  onToggleFavorite,
}) => {
  const { t } = useTranslation();
  const displayPhone = phone || '+216 74 200 100';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(14, 30, 56, 0.7)' : '#FFFFFF',
          borderColor: theme.cardBorder,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.textMain }]}>
        {t('directBookingTitle')}
      </Text>

      {/* Rangée des boutons d'action rapide : Appel direct + WhatsApp direct */}
      <View style={styles.contactRow}>
        {/* Bouton Appel Direct */}
        <TouchableOpacity
          accessibilityLabel={t('callVenue')}
          accessibilityRole="button"
          onPress={onCall}
          activeOpacity={0.85}
          style={[styles.contactBtn, { backgroundColor: '#0284C7' }]}
        >
          <View style={styles.contactIconCircle}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactBtnTitle}>{t('callVenue')}</Text>
            <Text style={styles.contactBtnSub} numberOfLines={1}>
              {displayPhone}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bouton WhatsApp Réservation */}
        <TouchableOpacity
          accessibilityLabel={t('whatsappBooking')}
          accessibilityRole="button"
          onPress={onWhatsApp}
          activeOpacity={0.85}
          style={[styles.contactBtn, { backgroundColor: '#10B981' }]}
        >
          <View style={[styles.contactIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactBtnTitle}>{t('whatsappBooking')}</Text>
            <Text style={styles.contactBtnSub} numberOfLines={1}>
              {t('instantChat')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bouton Itinéraire GPS Réel (Google Maps / Apple Maps) */}
      <TouchableOpacity
        accessibilityLabel={t('openGpsRoute')}
        accessibilityRole="button"
        onPress={onOpenMapDirection}
        activeOpacity={0.88}
        style={[styles.gpsRouteButton, { backgroundColor: theme.primary }]}
      >
        <View style={styles.gpsIconCircle}>
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.gpsRouteText}>
          {t('openGpsRoute')}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      {/* Actions secondaires : Partager & Favoris */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onShare}
          style={[
            styles.secondaryAction,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F0F9FF',
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Ionicons name="share-social-outline" size={18} color={theme.primary} />
          <Text style={[styles.secondaryActionText, { color: theme.textMain }]}>
            {t('share')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={onToggleFavorite}
          style={[
            styles.secondaryAction,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F0F9FF',
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#EF4444' : theme.primary}
          />
          <Text
            style={[
              styles.secondaryActionText,
              { color: isFavorite ? '#EF4444' : theme.textMain },
            ]}
          >
            {isFavorite ? t('inFavorites') : t('addToFavorites')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  contactIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactBtnTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  contactBtnSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  gpsRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
  },
  gpsIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsRouteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
