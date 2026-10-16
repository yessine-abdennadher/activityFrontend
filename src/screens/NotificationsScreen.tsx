import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { useNotifications } from '../context/NotificationContext';
import { AuthUser, Activity } from '../types';
import { AppNotification } from '../services/notificationService';
import { NotificationHeader } from '../components/notifications/NotificationHeader';
import {
  NotificationFilterChips,
  NotificationCategory,
  FilterChipItem,
} from '../components/notifications/NotificationFilterChips';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { NotificationEmptyState } from '../components/notifications/NotificationEmptyState';

interface NotificationsScreenProps {
  currentUser: AuthUser | null;
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  onOpenPartnerDashboard?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  currentUser,
  activities,
  onSelectActivity,
  onOpenPartnerDashboard,
  onOpenAdminDashboard,
}) => {
  const { theme, isDark } = usePreferences();
  const { t } = useTranslation();
  const role = currentUser?.role || 'user';

  // Consommation du contexte global réactif des notifications
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotificationItem,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<NotificationCategory>('all');

  // Filtrage selon le Chip actif
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeFilter === 'unread') return !notif.read;
      if (activeFilter === 'alerts') return notif.category === 'alerts';
      if (activeFilter === 'offers_reviews') return notif.category === 'offers_reviews';
      if (activeFilter === 'management') return notif.category === 'management';
      return true;
    });
  }, [notifications, activeFilter]);

  // Action rapide CTA direct
  const handleCtaPress = (notif: AppNotification) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }

    if (notif.actionType === 'activity' && notif.activityId) {
      const target = activities.find((a) => a.id === notif.activityId);
      if (target) {
        onSelectActivity(target);
      }
    } else if (notif.actionType === 'partner_dashboard' && onOpenPartnerDashboard) {
      onOpenPartnerDashboard();
    } else if (notif.actionType === 'admin_dashboard' && onOpenAdminDashboard) {
      onOpenAdminDashboard();
    }
  };

  // Configuration des chips de filtrage
  const filterChips = useMemo<FilterChipItem[]>(() => {
    const list: FilterChipItem[] = [
      {
        key: 'all',
        label: t('filterAll'),
        icon: 'layers-outline',
      },
      {
        key: 'unread',
        label: t('filterUnread'),
        icon: 'mail-unread-outline',
        badge: unreadCount,
      },
      {
        key: 'alerts',
        label: t('filterAlerts'),
        icon: 'flash-outline',
      },
      {
        key: 'offers_reviews',
        label: t('filterOffersReviews'),
        icon: 'star-outline',
      },
    ];

    if (role === 'partner' || role === 'admin') {
      list.push({
        key: 'management',
        label: t('filterManagement'),
        icon: 'shield-outline',
      });
    }

    return list;
  }, [t, role, unreadCount]);

  const headerTitle = t('notifications');
  const headerSubtitle =
    role === 'admin'
      ? t('notificationsSubtitleAdmin')
      : role === 'partner'
      ? t('notificationsSubtitlePartner')
      : t('notificationsSubtitleUser');

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshNotifications}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
    >
      <View style={styles.container}>
        {/* ── 1. En-tête modulaire ────────────────────────────────────────── */}
        <NotificationHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          unreadCount={unreadCount}
          theme={theme}
          isDark={isDark}
          onMarkAllRead={markAllAsRead}
        />

        {/* ── 2. Chips de filtrage horizontaux ────────────────────────────── */}
        <NotificationFilterChips
          chips={filterChips}
          activeFilter={activeFilter}
          theme={theme}
          isDark={isDark}
          onSelectFilter={setActiveFilter}
        />

        {/* ── 3. Contenu de la liste ───────────────────────────────────────── */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : filteredNotifications.length === 0 ? (
          <NotificationEmptyState
            theme={theme}
            isDark={isDark}
          />
        ) : (
          <View style={styles.notifsList}>
            {filteredNotifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                theme={theme}
                isDark={isDark}
                onCtaPress={handleCtaPress}
                onToggleRead={markAsRead}
                onDelete={deleteNotificationItem}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 110,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifsList: {
    gap: 12,
    marginTop: 4,
  },
});
