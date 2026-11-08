/**
 * pushNotificationService.ts
 * Service universel de notifications push & notifications locales planifiées pour ActivityTN.
 *
 * Fonctionnalités :
 * - Gestion du Push Token Expo (FCM Android & APNs Apple)
 * - Canaux de notification Android haute priorité (Sons, vibrations et bannières)
 * - Notifications locales planifiées intelligentes avec variations de styles (Soirées, Brunch, Plein Air, Promos, KharjaBot)
 * - Activation / Désactivation persistée (paramètre Profil)
 * - Déclenchement d'une notification test instantanée
 * - Support multilingue (FR, AR, EN)
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Storage, STORAGE_KEYS } from './storage';

// 1. Configuration du gestionnaire de notifications au premier plan (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Configure les canaux de notifications Android obligatoires pour Android 8.0+ (API 26+)
 */
export async function setupAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    // Canal 1 : Soirées Live & Événements Partenaires
    await Notifications.setNotificationChannelAsync('outings_events', {
      name: 'Sorties & Événements Live',
      description: 'Alertes pour les soirées musicales, DJ sets et événements du week-end',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      sound: 'default',
    });

    // Canal 2 : Bons Plans & Promotions Flash
    await Notifications.setNotificationChannelAsync('promos_deals', {
      name: 'Bons Plans & Promotions Pro',
      description: 'Réductions exclusives et offres spéciales des partenaires ActivityTN',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#F59E0B',
      sound: 'default',
    });

    // Canal 3 : Inspirations Détente & Concierge KharjaBot
    await Notifications.setNotificationChannelAsync('reminders_weekend', {
      name: 'Inspirations & Concierge KharjaBot',
      description: 'Idées de sorties café, brunchs et suggestions personnalisées',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  } catch (error) {
    console.warn('[pushNotificationService] Erreur création des canaux Android:', error);
  }
}

/**
 * Demande la permission et récupère le jeton Push Expo de l'appareil
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    await setupAndroidNotificationChannels();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[pushNotificationService] Permission de notification refusée par l\'utilisateur.');
      return null;
    }

    // Récupération du token Expo
    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
    const token = tokenData?.data || null;

    if (token) {
      await Storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
      console.log('[pushNotificationService] 📲 Token Push Expo enregistré:', token);
    }

    return token;
  } catch (error) {
    console.warn('[pushNotificationService] Erreur enregistrement push token:', error);
    return null;
  }
}

/**
 * Vérifie si les notifications sont activées dans les préférences utilisateur
 */
export async function getNotificationsEnabled(): Promise<boolean> {
  const val = await Storage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
  // Par défaut, activé si non configuré
  return val === null ? true : val === 'true';
}

/**
 * Active ou désactive les notifications (utilisé dans ProfileScreen)
 */
export async function setNotificationsEnabled(enabled: boolean, language: string = 'fr'): Promise<void> {
  await Storage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled ? 'true' : 'false');

  if (enabled) {
    await registerForPushNotificationsAsync();
    await scheduleLocalNotificationsAsync(language);
  } else {
    // Annulation de toutes les alertes planifiées (uniquement sur mobile natif)
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    console.log('[pushNotificationService] 🔕 Toutes les notifications planifiées ont été annulées.');
  }
}

import { getRandomizedSchedule, NOTIFICATION_SLOTS } from '../data/notificationTemplates';

/**
 * Planifie les alertes récurrentes avec variation aléatoire de styles (évite la répétition hebdomadaire)
 */
export async function scheduleLocalNotificationsAsync(lang: string = 'fr'): Promise<void> {
  // Les notifications locales planifiées ne sont pas supportées sur Web
  if (Platform.OS === 'web') {
    return;
  }

  const isEnabled = await getNotificationsEnabled();
  if (!isEnabled) {
    console.log('[pushNotificationService] Notifications désactivées par l\'utilisateur, planification ignorée.');
    return;
  }

  try {
    // Annule les anciennes alertes planifiées pour éviter les doublons
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Pioche une variante créative au hasard pour chaque créneau hebdomadaire
    const scheduledItems = getRandomizedSchedule(lang);

    for (const item of scheduledItems) {
      await Notifications.scheduleNotificationAsync({
        identifier: item.id,
        content: {
          title: item.title,
          body: item.body,
          sound: true,
          badge: 1,
          data: { type: item.id, channelId: item.channelId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: item.triggerDayOfWeek,
          hour: item.triggerHour,
          minute: item.triggerMinute,
        },
      });
    }

    console.log(`[pushNotificationService] 🔔 ${scheduledItems.length} notifications planifiées avec succès (variantes aléatoires).`);
  } catch (error) {
    console.warn('[pushNotificationService] Erreur lors de la planification des notifications:', error);
  }
}

/**
 * Déclenche une notification test immédiate (utile pour vérifier le rendu visuel et sonore)
 */
export async function triggerTestNotificationAsync(lang: string = 'fr'): Promise<void> {
  const isEnabled = await getNotificationsEnabled();
  if (!isEnabled) return;

  const normalizedLang = lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : 'fr';

  // Pioche aléatoire parmi tous les thèmes et variantes créatives
  const randomSlot = NOTIFICATION_SLOTS[Math.floor(Math.random() * NOTIFICATION_SLOTS.length)];
  const randomVariant = randomSlot.variants[Math.floor(Math.random() * randomSlot.variants.length)];

  const title = randomVariant.titles[normalizedLang] || randomVariant.titles.fr;
  const body = randomVariant.bodies[normalizedLang] || randomVariant.bodies.fr;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `[Test] ${title}`,
      body,
      sound: true,
      badge: 1,
      data: { type: 'test', slotId: randomSlot.id, variantId: randomVariant.id },
    },
    trigger: null, // Déclenchement instantané
  });
}
