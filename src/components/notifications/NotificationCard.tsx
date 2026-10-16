import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';
import { AppNotification } from '../../services/notificationService';
import { useTranslation } from '../../hooks/useTranslation';

interface NotificationCardProps {
  notification: AppNotification;
  theme: ThemeColors;
  isDark: boolean;
  onCtaPress: (notif: AppNotification) => void;
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  theme,
  isDark,
  onCtaPress,
  onToggleRead,
  onDelete,
}) => {
  const { t } = useTranslation();
  const iconName = (notification.icon || 'notifications-outline') as keyof typeof Ionicons.glyphMap;
  const ctaIconName = notification.ctaIcon
    ? (notification.ctaIcon as keyof typeof Ionicons.glyphMap)
    : undefined;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: notification.read
            ? theme.cardBorder
            : isDark
            ? '#38BDF8'
            : '#0284C7',
          borderWidth: notification.read ? 1 : 1.5,
        },
      ]}
    >
      {/* ── En-tête de la carte : Icône, Badge catégorie, Horodatage & Nouveau ── */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: notification.color + '1A',
              borderColor: notification.color + '40',
            },
          ]}
        >
          <Ionicons name={iconName} size={20} color={notification.color} />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.metaRow}>
            {Boolean(notification.badgeLabel) && (
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: notification.color + '18' },
                ]}
              >
                <Text style={[styles.categoryPillText, { color: notification.color }]}>
                  {notification.badgeLabel}
                </Text>
              </View>
            )}

            <Text style={[styles.timeText, { color: theme.textMuted }]}>
              {notification.time || t('notifRecently')}
            </Text>

            {!notification.read && (
              <View style={styles.newBadgeTag}>
                <View style={[styles.liveDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.newBadgeText, { color: theme.primary }]}>
                  {t('notifNew')}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: theme.textMain }]}>
            {notification.title}
          </Text>
        </View>

        {/* Bouton fermeture / suppression rapide */}
        <TouchableOpacity
          onPress={() => onDelete(notification.id)}
          style={styles.deleteBtn}
          accessibilityLabel={t('notifDelete')}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* ── Corps de la notification ── */}
      <Text style={[styles.description, { color: theme.textMuted }]}>
        {notification.description}
      </Text>

      {/* ── Barre d'action rapide (CTA direct) ── */}
      <View
        style={[
          styles.ctaRow,
          {
            borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
          },
        ]}
      >
        {Boolean(notification.ctaText) && (
          <TouchableOpacity
            onPress={() => onCtaPress(notification)}
            style={[styles.primaryCtaBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.85}
          >
            {Boolean(ctaIconName) && (
              <Ionicons name={ctaIconName!} size={15} color="#FFFFFF" />
            )}
            <Text style={styles.primaryCtaText}>{notification.ctaText}</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => onToggleRead(notification.id)}
          style={[
            styles.toggleReadBtn,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
              borderColor: theme.cardBorder,
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={notification.read ? 'mail-outline' : 'checkmark-circle-outline'}
            size={15}
            color={theme.textMuted}
          />
          <Text style={[styles.toggleReadText, { color: theme.textMuted }]}>
            {notification.read ? t('notifUnread') : t('notifRead')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  newBadgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 12,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  primaryCtaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  toggleReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleReadText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
