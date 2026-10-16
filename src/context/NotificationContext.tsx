import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { usePreferences } from './AppPreferencesContext';
import { useToast } from './ToastContext';
import {
  AppNotification,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../services/notificationService';

export interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotificationItem: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { language } = usePreferences();
  const toast = useToast();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Garde une trace des IDs connus pour détecter de nouvelles alertes reçues en tâche de fond
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef<boolean>(false);

  const loadNotifications = useCallback(
    async (isSilent = false) => {
      if (!isSilent) {
        if (!initialLoadDoneRef.current) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
      }

      try {
        const res = await fetchNotifications(language);
        const incoming = res.notifications || [];

        // Si le chargement initial a déjà eu lieu et qu'une nouvelle notification non lue arrive
        if (initialLoadDoneRef.current) {
          const brandNew = incoming.filter(
            (n) => !n.read && !knownIdsRef.current.has(n.id)
          );
          if (brandNew.length > 0) {
            const latest = brandNew[0];
            toast.info(latest.title, 'ActivityTN');
          }
        }

        // Met à jour les IDs connus
        knownIdsRef.current = new Set(incoming.map((n) => n.id));
        setNotifications(incoming);
        setUnreadCount(res.unreadCount ?? incoming.filter((n) => !n.read).length);
        initialLoadDoneRef.current = true;
      } catch (err) {
        console.warn('[NotificationContext] Erreur chargement notifications:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [language, toast]
  );

  // Chargement initial et lors du changement de langue
  useEffect(() => {
    loadNotifications(false);
  }, [loadNotifications]);

  // Synchronisation automatique en arrière-plan toutes les 30 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      loadNotifications(true);
    }, 30000);

    return () => clearInterval(timer);
  }, [loadNotifications]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.warn('[NotificationContext] Échec markNotificationAsRead:', err);
    }
  }, []);

  // Tout marquer comme lu
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.warn('[NotificationContext] Échec markAllNotificationsAsRead:', err);
    }
  }, []);

  // Supprimer une notification
  const deleteNotificationItem = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((item) => item.id !== id);
    });

    try {
      await deleteNotification(id);
    } catch (err) {
      console.warn('[NotificationContext] Échec deleteNotification:', err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications(false);
  }, [loadNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotificationItem,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé à l’intérieur d’un NotificationProvider');
  }
  return context;
}
