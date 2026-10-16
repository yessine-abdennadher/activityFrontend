import { getApiBaseUrl } from './apiConfig';
import { getAuthToken } from './authService';

export interface AppNotification {
  id: string;
  category: 'alerts' | 'offers_reviews' | 'management';
  type: string;
  title: string;
  description: string;
  time?: string;
  icon: string;
  color: string;
  badgeLabel?: string;
  ctaText?: string;
  ctaIcon?: string;
  actionType?: 'activity' | 'partner_dashboard' | 'admin_dashboard' | 'none';
  activityId?: string | null;
  read: boolean;
  createdAt?: string;
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Récupère les notifications réelles depuis le backend MongoDB.
 */
export async function fetchNotifications(lang: string = 'fr'): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/notifications?lang=${lang}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }
    const data = await res.json();
    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0,
    };
  } catch (err) {
    console.warn('[NotificationService] Échec appel backend, utilisation fallback:', err);
    return {
      notifications: [],
      unreadCount: 0,
    };
  }
}

/**
 * Marque une notification comme lue sur le backend.
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: buildHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Marque toutes les notifications comme lues sur le backend.
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/notifications/read-all`, {
      method: 'PATCH',
      headers: buildHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Supprime une notification sur le backend.
 */
export async function deleteNotification(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/notifications/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
