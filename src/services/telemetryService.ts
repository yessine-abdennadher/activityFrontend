import { getApiBaseUrl } from './apiConfig';
import { getAuthToken } from './authService';

let currentSessionId = 'session_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
let lastTrackedScreen = '';

/**
 * Envoie un événement de télémétrie de manière silencieuse et asynchrone
 */
async function sendTelemetry(
  eventType: 'session_start' | 'screen_view' | 'action',
  screenName: string,
  metadata: Record<string, any> = {}
) {
  try {
    const url = `${getApiBaseUrl()}/telemetry/track`;
    const token = getAuthToken();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sessionId: currentSessionId,
        eventType,
        screenName,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      }),
      signal: controller.signal,
    })
      .then(() => clearTimeout(timeoutId))
      .catch(() => {
        // En cas d'erreur réseau, ne pas bloquer l'application
        clearTimeout(timeoutId);
      });
  } catch {
    // Télémétrie silencieuse
  }
}

/**
 * Enregistre le lancement d'une nouvelle session de l'application
 */
export function trackSessionStart() {
  sendTelemetry('session_start', 'app_start', {
    startedAt: new Date().toISOString(),
  });
}

/**
 * Enregistre la consultation d'une section ou d'un écran
 */
export function trackScreenView(screenName: string, extraData: Record<string, any> = {}) {
  if (!screenName || screenName === lastTrackedScreen) return;
  lastTrackedScreen = screenName;
  sendTelemetry('screen_view', screenName, extraData);
}

/**
 * Enregistre une interaction clé (clic bouton, filtre, recherche)
 */
export function trackUserAction(actionName: string, metadata: Record<string, any> = {}) {
  sendTelemetry('action', actionName, metadata);
}
